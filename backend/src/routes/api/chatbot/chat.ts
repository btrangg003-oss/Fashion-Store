import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth';
import { findUserById } from '@/services/database';
import { getUserOrders } from '@/services/ordersDatabase';
import { readProducts } from '@/services/productsDatabase';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;
    
    // Get user context (optional - for personalization)
    let userContext: any = null;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const user = await findUserById(decoded.userId);
        
        // Check if account is restricted - cannot use chatbot
        if (user && user.accountStatus === 'restricted') {
          return res.status(403).json({
            success: false,
            error: '⚠️ Tài khoản của bạn bị hạn chế không thể sử dụng chatbot. Vui lòng liên hệ admin để biết thêm chi tiết.',
            accountStatus: 'restricted'
          });
        }
        
        userContext = {
          userId: decoded.userId,
          userName: user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          email: user?.email,
          role: 'user' // IMPORTANT: Always 'user' role for chatbot
        };
      }
    }

    // Get last message
    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    
    // Detect intent
    const intent = detectIntent(lastMessage);

    let response = '';
    let products: any[] = [];
    let orders: any[] = [];

    // Search for products if intent is product-related
    if (intent === 'search_product' || intent === 'product_consultation') {
      products = await searchProducts(lastMessage);
    }
    
    // Get orders if intent is order-related
    if (intent === 'check_order' && userContext) {
      orders = await checkUserOrders(userContext.userId, lastMessage);
    }
    
    // Call OpenAI with context
    response = await getAIResponse(messages, intent, products, orders, userContext);

    // Generate suggestions based on intent
    const suggestions = generateSuggestions(intent, userContext);

    return res.status(200).json({
      success: true,
      message: response,
      products,
      orders,
      suggestions,
      intent
    });

  } catch (error: any) {
    console.error('Chatbot error:', error);
    return res.status(500).json({
      success: false,
      error: 'Đã có lỗi xảy ra. Vui lòng thử lại sau. 😔'
    });
  }
}

// Intent detection
function detectIntent(message: string): string {
  // Order check keywords (highest priority)
  const orderKeywords = ['đơn hàng', 'order', 'mã đơn', 'kiểm tra đơn', 'tra cứu', 'fs', 'đặt hàng'];
  if (orderKeywords.some(kw => message.includes(kw))) {
    return 'check_order';
  }
  
  // Product keywords - auto search when customer describes products
  const productKeywords = [
    // Clothing
    'áo', 'quần', 'váy', 'đầm', 'jacket', 'khoác', 'sơ mi', 'thun', 'polo', 'hoodie',
    'jean', 'jeans', 'tây', 'short', 'dài', 'ngắn',
    // Accessories
    'giày', 'dép', 'sandal', 'sneaker', 'boot',
    'túi', 'balo', 'ví', 'mũ', 'nón', 'khăn', 'thắt lưng',
    // Descriptions
    'tìm', 'mua', 'có', 'cần', 'muốn', 'xem',
    'màu', 'size', 'giá', 'rẻ', 'đẹp', 'xinh',
    // Occasions
    'đi làm', 'công sở', 'đi chơi', 'dự tiệc', 'casual',
    // Consultation
    'tư vấn', 'chi tiết', 'thông tin', 'review', 'đánh giá', 
    'có tốt không', 'có đẹp không', 'nên mua', 'chất lượng',
    'hợp không', 'phù hợp', 'tặng', 'quà'
  ];
  
  if (productKeywords.some(kw => message.includes(kw))) {
    return 'search_product';
  }
  
  return 'general_question';
}

// Search products based on description
async function searchProducts(query: string): Promise<any[]> {
  try {
    const products = await readProducts();
    
    // Extract keywords
    const keywords = query.toLowerCase()
      .replace(/[^\w\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1);
    
    // Score products
    const scoredProducts = products.map(product => {
      const searchText = `${product.name} ${product.description || ''} ${product.categoryId || ''}`.toLowerCase();
      let score = 0;
      
      keywords.forEach(keyword => {
        if (searchText.includes(keyword)) {
          score += 1;
          // Bonus for name match
          if (product.name.toLowerCase().includes(keyword)) {
            score += 2;
          }
        }
      });
      
      return { product, score };
    });
    
    // Filter and sort
    const matches = scoredProducts
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => ({
        ...item.product,
        image: item.product.featuredImage || '', // Map featuredImage to image for chatbot
        category: item.product.categoryId
      }))
      .slice(0, 6); // Top 6 results
    
    return matches;
  } catch (error) {
    console.error('Search products error:', error);
    return [];
  }
}

// Check user orders (SECURITY: Only user's own orders)
async function checkUserOrders(userId: string, query: string): Promise<any[]> {
  try {
    const orders = await getUserOrders(userId); // ✅ Only user's orders
    
    // Search by order number
    const orderNumberMatch = query.match(/FS\d+/i);
    if (orderNumberMatch) {
      const orderNumber = orderNumberMatch[0].toUpperCase();
      const found = orders.filter(o => o.orderNumber === orderNumber);
      return found.length > 0 ? found : orders.slice(0, 3);
    }
    
    // Return recent orders
    return orders.slice(0, 3);
  } catch (error) {
    console.error('Check orders error:', error);
    return [];
  }
}

// Format product response
function formatProductResponse(products: any[], query: string): string {
  if (products.length === 0) {
    return '🥺 Ôi, em tìm mãi không thấy món nào giống như bạn mô tả...\n\n' +
           'Nhưng đừng lo! Em có thể tư vấn cho bạn:\n' +
           '💡 Bạn muốn tìm món gì? (áo, quần, váy, giày...)\n' +
           '💡 Màu sắc yêu thích? (đen, trắng, pastel...)\n' +
           '💡 Phong cách nào? (công sở, casual, dạo phố...)\n' +
           '💡 Dịp gì? (đi làm, đi chơi, dự tiệc...)\n\n' +
           '✨ Hoặc bạn xem BST mới nhất của shop em đi! Toàn món hot hit, đẹp mê ly luôn! 😍\n' +
           '🔥 Đang sale 50% đó, nhanh tay kẻo hết hàng! 🔥';
  }
  
  // Build detailed product description
  let response = '';
  
  if (products.length >= 5) {
    response = '🤩 WOWWW! Em tìm được cả ${products.length} món SIÊU PHẨM cho bạn đây!\n\n';
  } else if (products.length >= 3) {
    response = '✨ Tuyệt vời! Em tìm được ${products.length} món cực đẹp cho bạn!\n\n';
  } else {
    response = '💖 Em tìm được ${products.length} món xinh xắn này cho bạn!\n\n';
  }
  
  // Add product highlights
  response += '👇 Bạn xem qua nhé, em đảm bảo chất lượng 100% luôn! 💯\n\n';
  
  // Add selling points based on products
  const hasExpensive = products.some(p => p.price > 500000);
  const hasCheap = products.some(p => p.price < 300000);
  
  if (hasExpensive && hasCheap) {
    response += '💰 Có cả món cao cấp lẫn món giá tốt, bạn chọn thoải mái nha!\n';
  } else if (hasExpensive) {
    response += '👑 Toàn món cao cấp, chất lượng premium, đáng đồng tiền bát gạo!\n';
  } else if (hasCheap) {
    response += '🎉 Giá cực tốt luôn! Mua ngay kẻo hết hàng nha!\n';
  }
  
  // Add urgency and benefits
  response += '\n🔥 **Ưu đãi đặc biệt:**\n';
  response += '✅ Freeship đơn từ 500k\n';
  response += '✅ Đổi trả miễn phí trong 7 ngày\n';
  response += '✅ Tích điểm đổi quà\n';
  response += '✅ Tư vấn size miễn phí\n\n';
  response += '💬 Click vào món nào bạn thích để xem chi tiết nha!\n';
  response += '📞 Hoặc hỏi em thêm về bất kỳ món nào, em tư vấn tận tình! 😊';
  
  return response;
}

// Get AI response with professional sales tone
async function getAIResponse(
  messages: any[],
  intent: string,
  products: any[],
  orders: any[],
  userContext: any
): Promise<string> {
  try {
    // Build system prompt with professional sales guidelines
    const systemPrompt = buildSystemPrompt(intent, products, orders, userContext);
    
    // Prepare messages for OpenAI
    const aiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content
      }))
    ];
    
    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: aiMessages as any,
      temperature: 0.8,
      max_tokens: 1000,
    });
    
    return completion.choices[0]?.message?.content || 'Xin lỗi, em gặp sự cố. Bạn thử lại nhé! 😊';
  } catch (error) {
    console.error('OpenAI error:', error);
    return 'Xin lỗi, em gặp sự cố khi xử lý. Bạn thử lại sau nhé! 😊';
  }
}

// Build system prompt with professional sales guidelines
function buildSystemPrompt(
  intent: string,
  products: any[],
  orders: any[],
  userContext: any
): string {
  const userName = userContext?.userName || '';
  
  let prompt = `Bạn là Linh - tư vấn viên thời trang chuyên nghiệp của Fashion Store.

**PHONG CÁCH TƯ VẤN:**
1. Tư vấn như người bạn thân thiết, mềm mại, không ép buộc
2. Đưa ra lựa chọn thay vì ép mua: "Bạn thử xem mẫu nào ưng hơn nhé" thay vì "Bạn mua đi"
3. Nói lợi ích thay vì đặc điểm kỹ thuật:
   - ❌ "Cotton 100%" → ✅ "Vải mát, mặc cả ngày dễ chịu"
   - ❌ "Form slim fit" → ✅ "Form ôm vừa vặn, tôn dáng bạn lắm"
4. Tạo cảm xúc tích cực: "Mình cũng nên tự thưởng bản thân chút xíu nhỉ!"
5. Khan hiếm nhẹ nhàng: "Mẫu này đang hot đó ạ" thay vì "Hết hàng rồi!"
6. Khen khéo, không quá đà: "Bạn mặc vào sẽ xinh lắm đó ạ"

**NGUYÊN TẮC:**
- Xưng hô: "em" (mình) / "bạn" (khách hàng)
- Luôn thêm "ạ" cuối câu để lịch sự
- Dùng emoji phù hợp: 💖 😊 ✨ 🎯 💝
- Câu văn ngắn gọn, dễ hiểu
- Nhiệt tình nhưng không quá đà

**PHÂN BIỆT:**
- Mua cho bản thân: "Bạn mặc vào sẽ...", "Tôn dáng bạn lắm", "Tự thưởng bản thân"
- Mua tặng: "Món quà ý nghĩa", "Người nhận sẽ thích lắm", "Tặng là họ nhớ bạn mãi"

**ƯU ĐÃI HIỆN TẠI:**
- Freeship đơn từ 500k
- Tặng túi xinh khi mua bất kỳ sản phẩm nào
- Đổi trả miễn phí trong 7 ngày
- Tích điểm đổi quà

`;

  // Add user context
  if (userName) {
    prompt += `\n**KHÁCH HÀNG:** ${userName}\n`;
  }
  
  // Add products context
  if (products.length > 0) {
    prompt += `\n**SẢN PHẨM TÌM ĐƯỢC (${products.length} món):**\n`;
    products.slice(0, 3).forEach((p, i) => {
      prompt += `${i + 1}. ${p.name} - ${p.price.toLocaleString('vi-VN')}đ\n`;
      if (p.description) prompt += `   Mô tả: ${p.description}\n`;
      if (p.categoryId) prompt += `   Danh mục: ${p.categoryId}\n`;
    });
    
    prompt += `\n**HƯỚNG DẪN TƯ VẤN SẢN PHẨM:**
- Giới thiệu có ${products.length} mẫu, đưa ra lựa chọn
- Mô tả lợi ích (mát, thoải mái, tôn dáng) thay vì đặc điểm kỹ thuật
- Gợi ý cách phối đồ phù hợp
- Tạo cảm xúc: "Đáng được thưởng bản thân", "Tự tin hơn"
- Thêm khan hiếm nhẹ: "Đang hot", "Nhiều bạn mua"
- Kết thúc: "Bạn thích mẫu nào hơn ạ?" (đưa ra lựa chọn)
`;
  }
  
  // Add orders context
  if (orders.length > 0) {
    prompt += `\n**ĐƠN HÀNG CỦA KHÁCH (${orders.length} đơn):**\n`;
    orders.forEach((o, i) => {
      prompt += `${i + 1}. Đơn ${o.orderNumber} - ${o.status} - ${o.total.toLocaleString('vi-VN')}đ\n`;
      prompt += `   Ngày: ${new Date(o.createdAt).toLocaleDateString('vi-VN')}\n`;
    });
    
    prompt += `\n**HƯỚNG DẪN TƯ VẤN ĐƠN HÀNG:**
- Thông báo tìm thấy đơn hàng
- Giải thích trạng thái với note tích cực
- Gợi ý: "Mua thêm món khác", "Có cần tư vấn gì không?"
`;
  }
  
  // Add intent-specific guidelines
  if (intent === 'search_product' || intent === 'product_consultation') {
    if (products.length === 0) {
      prompt += `\n**KHÔNG TÌM THẤY SẢN PHẨM:**
- Hỏi thêm thông tin: màu sắc, kiểu dáng, dịp sử dụng
- Gợi ý xem BST mới nhất
- Giữ tone thân thiện, không thất vọng
`;
    }
  }
  
  prompt += `\n**LƯU Ý:**
- Trả lời bằng tiếng Việt
- Giữ tone như người bạn, không như bot
- Tập trung vào lợi ích khách hàng nhận được
- Luôn kết thúc bằng câu hỏi mở để khách tiếp tục trò chuyện
`;
  
  return prompt;
}

// Get age-appropriate pronoun
function getPronouns(userContext: any): { you: string; i: string } {
  if (!userContext) return { you: 'bạn', i: 'em' };
  
  // If user info available, adjust based on age/context
  // For now, default to friendly tone
  return { you: 'bạn', i: 'em' };
}

// Detect if buying for self or others
function detectBuyingFor(message: string): 'self' | 'gift' | 'unknown' {
  const giftKeywords = ['tặng', 'cho bạn', 'cho người yêu', 'cho vợ', 'cho chồng', 'cho mẹ', 'cho bố', 'quà'];
  if (giftKeywords.some(kw => message.includes(kw))) {
    return 'gift';
  }
  
  const selfKeywords = ['mình', 'tôi', 'em muốn', 'cho em'];
  if (selfKeywords.some(kw => message.includes(kw))) {
    return 'self';
  }
  
  return 'unknown';
}

// Get detailed consultation with multiple products
function getDetailedConsultation(products: any[], query: string, userContext: any): string {
  const pronouns = getPronouns(userContext);
  const buyingFor = detectBuyingFor(query);
  const productCount = Math.min(products.length, 3); // Show max 3 products
  
  let response = '';
  
  // Opening - friendly and welcoming
  if (productCount === 1) {
    response = `Dạ, ${pronouns.i} tìm được món này cho ${pronouns.you} ạ! ✨\n\n`;
  } else {
    response = `Dạ, bên shop ${pronouns.i} có ${productCount} mẫu hợp với ${pronouns.you} đó ạ! ${pronouns.you.charAt(0).toUpperCase() + pronouns.you.slice(1)} thử xem mẫu nào ưng hơn nhé! 😊\n\n`;
  }
  
  // Show each product with benefits-focused description
  products.slice(0, 3).forEach((product, index) => {
    response += getProductBenefitsDescription(product, index + 1, buyingFor, pronouns);
    response += '\n\n';
  });
  
  // Add emotional appeal
  response += getEmotionalAppeal(products[0], buyingFor, pronouns);
  
  // Add gentle scarcity
  response += '\n\n' + getGentleScarcity(products[0], pronouns);
  
  // Add current promotion
  response += '\n\n' + getCurrentPromotion(pronouns);
  
  // Closing - give choice, not pressure
  response += `\n\n💬 ${pronouns.you.charAt(0).toUpperCase() + pronouns.you.slice(1)} thích mẫu nào hơn ạ? Hoặc ${pronouns.you} muốn ${pronouns.i} tư vấn thêm về size, màu sắc gì không? ${pronouns.i} sẵn sàng hỗ trợ ${pronouns.you} nha! 😊`;
  
  return response;
}

// Get product description focused on benefits, not features
function getProductBenefitsDescription(product: any, index: number, buyingFor: string, pronouns: any): string {
  const name = product.name.toLowerCase();
  const price = product.price;
  let description = '';
  
  description += `**${index}. ${product.name}** - ${price.toLocaleString('vi-VN')}đ\n`;
  
  // Áo sơ mi / Shirts
  if (name.includes('áo sơ mi') || name.includes('shirt')) {
    if (buyingFor === 'self') {
      description += `\n💫 Mẫu này ${pronouns.i} thấy hợp với phong cách của ${pronouns.you} lắm đó ạ!\n\n` +
                    `✨ **Điểm hay:**\n` +
                    `• Vải mát lạnh, mặc cả ngày vẫn dễ chịu\n` +
                    `• Form ôm vừa vặn, tôn dáng ${pronouns.you} lắm\n` +
                    `• Không nhăn, không cần là nhiều\n` +
                    `• Mặc đi làm sang, đi chơi cũng xinh\n\n` +
                    `🎯 ${pronouns.you.charAt(0).toUpperCase() + pronouns.you.slice(1)} mặc vào nhìn sẽ chuyên nghiệp và lịch lãm hơn đó ạ!`;
    } else if (buyingFor === 'gift') {
      description += `\n💝 Món này làm quà rất ý nghĩa đó ${pronouns.you}!\n\n` +
                    `✨ **Điểm hay:**\n` +
                    `• Vải mát, mặc thoải mái cả ngày\n` +
                    `• Form đẹp, ai mặc cũng hợp\n` +
                    `• Dễ giặt, bền lâu\n` +
                    `• Phù hợp nhiều dịp\n\n` +
                    `🎁 Người nhận sẽ rất thích và dùng được lâu dài đó ạ!`;
    } else {
      description += `\n✨ **Điểm hay:**\n` +
                    `• Vải mát mẻ, thoáng khí\n` +
                    `• Form chuẩn, tôn dáng\n` +
                    `• Dễ phối đồ, đa năng\n` +
                    `• Bền đẹp, giặt không nhăn`;
    }
  }
  // Áo thun / T-shirts
  else if (name.includes('áo thun') || name.includes('t-shirt') || name.includes('tee')) {
    if (buyingFor === 'self') {
      description += `\n💫 Mẫu basic này ${pronouns.you} nên có đó ạ!\n\n` +
                    `✨ **Điểm hay:**\n` +
                    `• Vải mềm mịn, mặc siêu thoải mái\n` +
                    `• Form rộng vừa, che khuyết điểm tốt\n` +
                    `• Mix với gì cũng đẹp\n` +
                    `• Giá mềm, mua nhiều không lo\n\n` +
                    `🎯 ${pronouns.you.charAt(0).toUpperCase() + pronouns.you.slice(1)} mặc đi chơi, đi học hay ở nhà đều ok nha!`;
    } else if (buyingFor === 'gift') {
      description += `\n💝 Áo thun là món quà an toàn và thiết thực đó ${pronouns.you}!\n\n` +
                    `✨ **Điểm hay:**\n` +
                    `• Vải mềm, thoải mái\n` +
                    `• Ai cũng mặc được\n` +
                    `• Dùng hàng ngày tiện lợi\n` +
                    `• Giá phải chăng\n\n` +
                    `🎁 Món này ai nhận cũng thích và dùng được luôn ạ!`;
    } else {
      description += `\n✨ **Điểm hay:**\n` +
                    `• Vải cotton mềm mại\n` +
                    `• Thoải mái, thoáng mát\n` +
                    `• Dễ phối, đa dụng\n` +
                    `• Giá tốt, chất lượng cao`;
    }
  }
  // Quần jeans
  else if (name.includes('quần jean') || name.includes('jeans')) {
    if (buyingFor === 'self') {
      description += `\n💫 Quần jeans này ${pronouns.i} recommend cho ${pronouns.you} luôn!\n\n` +
                    `✨ **Điểm hay:**\n` +
                    `• Vải denim co giãn, vận động thoải mái\n` +
                    `• Form đẹp, che khuyết điểm chân\n` +
                    `• Bền lắm, mặc được vài năm\n` +
                    `• Mix với áo gì cũng hợp\n\n` +
                    `🎯 ${pronouns.you.charAt(0).toUpperCase() + pronouns.you.slice(1)} mặc vào sẽ trông cao ráo và gọn gàng hơn đó ạ!`;
    } else if (buyingFor === 'gift') {
      description += `\n💝 Quần jeans là món quà rất đáng đầu tư đó ${pronouns.you}!\n\n` +
                    `✨ **Điểm hay:**\n` +
                    `• Vải bền, dùng được lâu\n` +
                    `• Form đẹp, ai mặc cũng ok\n` +
                    `• Thực dụng, dùng hàng ngày\n` +
                    `• Không bao giờ lỗi mốt\n\n` +
                    `🎁 Món này tặng là người nhận sẽ nhớ ${pronouns.you} mãi đó ạ!`;
    } else {
      description += `\n✨ **Điểm hay:**\n` +
                    `• Vải denim co giãn tốt\n` +
                    `• Form chuẩn, tôn dáng\n` +
                    `• Bền bỉ, lâu phai\n` +
                    `• Đa năng, dễ phối`;
    }
  }
  // Váy / Dresses
  else if (name.includes('váy') || name.includes('đầm') || name.includes('dress')) {
    if (buyingFor === 'self') {
      description += `\n💫 Váy này ${pronouns.you} mặc vào sẽ xinh lắm đó ạ!\n\n` +
                    `✨ **Điểm hay:**\n` +
                    `• Vải mềm mại, mát mẻ\n` +
                    `• Thiết kế nữ tính, tôn dáng\n` +
                    `• Mặc lên tự tin ngay\n` +
                    `• Chụp ảnh lên hình đẹp\n\n` +
                    `🎯 ${pronouns.you.charAt(0).toUpperCase() + pronouns.you.slice(1)} mặc đi dự tiệc hay hẹn hò đều dễ thương hết nấc luôn ạ!`;
    } else if (buyingFor === 'gift') {
      description += `\n💝 Váy này tặng người yêu thương rất ý nghĩa đó ${pronouns.you}!\n\n` +
                    `✨ **Điểm hay:**\n` +
                    `• Vải đẹp, mềm mại\n` +
                    `• Thiết kế sang trọng\n` +
                    `• Mặc nhiều dịp được\n` +
                    `• Đóng gói làm quà xinh xắn\n\n` +
                    `🎁 Người nhận sẽ rất vui và cảm động đó ạ!`;
    } else {
      description += `\n✨ **Điểm hay:**\n` +
                    `• Vải lụa/cotton mềm mại\n` +
                    `• Thiết kế nữ tính, thanh lịch\n` +
                    `• Tôn dáng, che khuyết điểm\n` +
                    `• Phù hợp nhiều dịp`;
    }
  }
  // Giày / Shoes
  else if (name.includes('giày') || name.includes('shoe') || name.includes('sneaker')) {
    if (buyingFor === 'self') {
      description += `\n💫 Đôi giày này ${pronouns.i} thấy hợp với ${pronouns.you} lắm!\n\n` +
                    `✨ **Điểm hay:**\n` +
                    `• Đế êm, đi cả ngày không mỏi\n` +
                    `• Thiết kế trendy, bắt mắt\n` +
                    `• Chống trơn tốt, an toàn\n` +
                    `• Mix với đồ gì cũng đẹp\n\n` +
                    `🎯 ${pronouns.you.charAt(0).toUpperCase() + pronouns.you.slice(1)} đi vào sẽ thoải mái và tự tin hơn đó ạ!`;
    } else if (buyingFor === 'gift') {
      description += `\n💝 Giày là món quà thiết thực và ý nghĩa đó ${pronouns.you}!\n\n` +
                    `✨ **Điểm hay:**\n` +
                    `• Đế êm ái, thoải mái\n` +
                    `• Bền đẹp, dùng lâu\n` +
                    `• Thiết kế đẹp mắt\n` +
                    `• Dùng hàng ngày tiện lợi\n\n` +
                    `🎁 Tặng giày là tặng sự thoải mái cho người thân đó ạ!`;
    } else {
      description += `\n✨ **Điểm hay:**\n` +
                    `• Đế cao su êm chân\n` +
                    `• Thiết kế thời trang\n` +
                    `• Bền bỉ, chống trơn\n` +
                    `• Dễ vệ sinh, bảo quản`;
    }
  }
  // Default
  else {
    description += `\n✨ **Điểm hay:**\n` +
                  `• Chất lượng cao, bền đẹp\n` +
                  `• Thiết kế hiện đại, trendy\n` +
                  `• Dễ sử dụng, tiện lợi\n` +
                  `• Giá cả hợp lý`;
  }
  
  return description;
}

// Add emotional appeal
function getEmotionalAppeal(product: any, buyingFor: string, pronouns: any): string {
  if (buyingFor === 'self') {
    return `💖 **${pronouns.you.charAt(0).toUpperCase() + pronouns.you.slice(1)} biết không:**\n` +
           `Mình cũng nên tự thưởng cho bản thân mình chút xíu ${pronouns.you} nhỉ! ` +
           `Mặc đồ đẹp, mình tự tin hơn, làm việc cũng hiệu quả hơn đó ạ! 😊`;
  } else if (buyingFor === 'gift') {
    return `💝 **Món quà ý nghĩa:**\n` +
           `${pronouns.you.charAt(0).toUpperCase() + pronouns.you.slice(1)} tặng món này, người nhận sẽ cảm nhận được tình cảm của ${pronouns.you} đó ạ! ` +
           `Mỗi lần dùng là họ lại nhớ đến ${pronouns.you} nha! 🥰`;
  }
  return `💫 Món này hợp với phong cách hiện đại, ${pronouns.you} mặc đi làm hay đi chơi đều sang đó ạ!`;
}

// Add gentle scarcity (not threatening)
function getGentleScarcity(product: any, pronouns: any): string {
  const scarcityMessages = [
    `📢 **Thông tin thêm:** Mẫu này đang khá hot bên shop ${pronouns.i} đó ạ! Nhiều bạn mua về để đi làm, đi chơi với bạn bè lắm!`,
    `🔥 **Mẫu hot:** Dạ, mẫu này bên ${pronouns.i} đang bán chạy đó ạ! Kho còn không nhiều lắm rồi!`,
    `✨ **Bestseller:** Món này là top bán chạy tuần này đó ${pronouns.you}! Nhiều bạn review tốt lắm!`
  ];
  
  return scarcityMessages[Math.floor(Math.random() * scarcityMessages.length)];
}

// Add current promotion
function getCurrentPromotion(pronouns: any): string {
  return `🎁 **Ưu đãi hôm nay:**\n` +
         `• Freeship đơn từ 500k\n` +
         `• Tặng kèm túi xinh khi mua bất kỳ sản phẩm nào\n` +
         `• Đổi trả miễn phí trong 7 ngày\n` +
         `• Tích điểm đổi quà hấp dẫn`;
}

// Get detailed product description for consultation (old function - keep for compatibility)
function getDetailedProductDescription(product: any): string {
  const name = product.name.toLowerCase();
  const price = product.price;
  let details = '';
  
  // Áo sơ mi / Shirts
  if (name.includes('áo sơ mi') || name.includes('shirt')) {
    details = `👔 **${product.name}**\n\n` +
              `💰 Giá: **${price.toLocaleString('vi-VN')}đ** ${price < 400000 ? '(Giá cực tốt!)' : '(Cao cấp!)'}\n\n` +
              `✨ **Đặc điểm nổi bật:**\n` +
              `• Chất liệu: Cotton 100% cao cấp, thoáng mát\n` +
              `• Form dáng: Slim fit chuẩn Hàn Quốc, ôm vừa vặn\n` +
              `• Màu sắc: Trắng, xanh navy, đen - Dễ phối đồ\n` +
              `• Size: S, M, L, XL, XXL\n\n` +
              `🎯 **Phù hợp:**\n` +
              `• Đi làm văn phòng - Lịch sự, chuyên nghiệp\n` +
              `• Họp hành, gặp khách - Tạo ấn tượng tốt\n` +
              `• Dự tiệc, sự kiện - Sang trọng, lịch lãm\n\n` +
              `👗 **Cách phối đồ:**\n` +
              `• Mix với quần tây + giày tây = Set công sở hoàn hảo\n` +
              `• Mix với jeans + sneaker = Phong cách smart casual\n` +
              `• Thắt lưng da + đồng hồ = Hoàn thiện outfit\n\n` +
              `💎 **Tại sao nên mua:**\n` +
              `• Chất vải mềm mại, không nhăn, dễ giặt\n` +
              `• Form chuẩn, mặc lên trông cao hơn, gầy hơn\n` +
              `• Đầu tư 1 lần, mặc được nhiều năm\n` +
              `• Must-have item cho tủ đồ công sở!\n\n` +
              `🔥 Món này đang bán chạy nhất tuần này đó! Nhanh tay nha! 😊`;
  }
  // Áo thun / T-shirts
  else if (name.includes('áo thun') || name.includes('t-shirt') || name.includes('tee')) {
    details = `👕 **${product.name}**\n\n` +
              `💰 Giá: **${price.toLocaleString('vi-VN')}đ** ${price < 200000 ? '(Giá rẻ bất ngờ!)' : '(Chất lượng cao!)'}\n\n` +
              `✨ **Đặc điểm nổi bật:**\n` +
              `• Chất liệu: Cotton 4 chiều co giãn tốt\n` +
              `• Form dáng: Oversize rộng rãi, thoải mái\n` +
              `• Màu sắc: Đen, trắng, xám, nhiều màu trendy\n` +
              `• Size: M, L, XL, XXL (Unisex)\n\n` +
              `🎯 **Phù hợp:**\n` +
              `• Đi chơi, đi học - Năng động, trẻ trung\n` +
              `• Mặc nhà - Thoải mái tối đa\n` +
              `• Đi gym, chạy bộ - Thấm hút mồ hôi tốt\n\n` +
              `👗 **Cách phối đồ:**\n` +
              `• Mix với quần short + sandal = Style mùa hè\n` +
              `• Mix với jeans + sneaker = Look đơn giản mà chất\n` +
              `• Layer với áo khoác = Phong cách streetwear\n\n` +
              `💎 **Tại sao nên mua:**\n` +
              `• Giá rẻ, mua nhiều không lo hết tiền\n` +
              `• Vải mềm, mát, không xù lông\n` +
              `• Basic item, ai cũng cần có 5-10 cái\n` +
              `• Mua 2 tặng 1 đang áp dụng đó!\n\n` +
              `🔥 Best seller! Đã bán 500+ cái tháng này! 😍`;
  }
  // Quần jeans
  else if (name.includes('quần jean') || name.includes('jeans')) {
    details = `👖 **${product.name}**\n\n` +
              `💰 Giá: **${price.toLocaleString('vi-VN')}đ** (Đáng đầu tư!)\n\n` +
              `✨ **Đặc điểm nổi bật:**\n` +
              `• Chất liệu: Denim cao cấp, co giãn nhẹ\n` +
              `• Form dáng: Slim fit/Straight - Tôn dáng\n` +
              `• Màu sắc: Xanh đậm, xanh nhạt, đen\n` +
              `• Size: 28, 29, 30, 31, 32, 33, 34\n\n` +
              `🎯 **Phù hợp:**\n` +
              `• Mọi dịp - Từ đi làm đến đi chơi\n` +
              `• 4 mùa - Mặc quanh năm không lo\n` +
              `• Mọi lứa tuổi - Nam nữ đều mặc được\n\n` +
              `👗 **Cách phối đồ:**\n` +
              `• Mix với áo thun = Look casual thoải mái\n` +
              `• Mix với áo sơ mi = Style smart casual\n` +
              `• Mix với hoodie = Phong cách streetwear\n` +
              `• Đi với giày gì cũng đẹp!\n\n` +
              `💎 **Tại sao nên mua:**\n` +
              `• Bền bỉ, mặc được 3-5 năm\n` +
              `• Càng giặt càng đẹp, không phai màu\n` +
              `• Form chuẩn, che khuyết điểm chân\n` +
              `• Must-have #1 trong tủ đồ!\n\n` +
              `🔥 Món này không bao giờ lỗi mốt! Đầu tư ngay đi bạn! 💯`;
  }
  // Váy / Dresses
  else if (name.includes('váy') || name.includes('đầm') || name.includes('dress')) {
    details = `👗 **${product.name}**\n\n` +
              `💰 Giá: **${price.toLocaleString('vi-VN')}đ** (Xinh xắn!)\n\n` +
              `✨ **Đặc điểm nổi bật:**\n` +
              `• Chất liệu: Vải lụa/cotton mềm mại, mát mẻ\n` +
              `• Thiết kế: Nữ tính, thanh lịch, tôn dáng\n` +
              `• Màu sắc: Pastel, hoa văn nhẹ nhàng\n` +
              `• Size: S, M, L, XL\n\n` +
              `🎯 **Phù hợp:**\n` +
              `• Dự tiệc, sự kiện - Nổi bật, thu hút\n` +
              `• Hẹn hò - Ngọt ngào, dễ thương\n` +
              `• Đi chơi cuối tuần - Thoải mái, xinh xắn\n\n` +
              `👗 **Cách phối đồ:**\n` +
              `• Đi với giày cao gót = Sang trọng, quyến rũ\n` +
              `• Đi với sandal = Nhẹ nhàng, nữ tính\n` +
              `• Thêm túi xách nhỏ = Hoàn hảo!\n\n` +
              `💎 **Tại sao nên mua:**\n` +
              `• Mặc lên tự tin, xinh đẹp ngay\n` +
              `• Không cần phối đồ phức tạp\n` +
              `• Chụp ảnh cực ảo, lên hình đẹp\n` +
              `• Nhận được nhiều lời khen!\n\n` +
              `🔥 Nhiều bạn mua và review 5 sao lắm! Bạn cũng thử đi! 💕`;
  }
  // Giày / Shoes
  else if (name.includes('giày') || name.includes('shoe') || name.includes('sneaker')) {
    details = `👟 **${product.name}**\n\n` +
              `💰 Giá: **${price.toLocaleString('vi-VN')}đ** (Xịn xò!)\n\n` +
              `✨ **Đặc điểm nổi bật:**\n` +
              `• Chất liệu: Da tổng hợp cao cấp, bền đẹp\n` +
              `• Đế giày: Cao su chống trơn, êm chân\n` +
              `• Thiết kế: Thời trang, trendy\n` +
              `• Size: 36, 37, 38, 39, 40, 41, 42, 43, 44\n\n` +
              `🎯 **Phù hợp:**\n` +
              `• Đi chơi, đi học - Năng động\n` +
              `• Tập gym, chạy bộ - Hỗ trợ tốt\n` +
              `• Đi làm - Thoải mái cả ngày\n\n` +
              `👗 **Cách phối đồ:**\n` +
              `• Mix với jeans + áo thun = Classic\n` +
              `• Mix với quần jogger = Sporty\n` +
              `• Mix với váy = Cá tính, độc đáo\n\n` +
              `💎 **Tại sao nên mua:**\n` +
              `• Êm chân, đi cả ngày không mỏi\n` +
              `• Bền, đi được 1-2 năm\n` +
              `• Dễ vệ sinh, lau là sạch\n` +
              `• Đi với mọi outfit đều hợp!\n\n` +
              `🔥 Hot trend 2024! Ai cũng phải có 1 đôi! 🔥`;
  }
  // Default
  else {
    details = `✨ **${product.name}**\n\n` +
              `💰 Giá: **${price.toLocaleString('vi-VN')}đ**\n\n` +
              `🎯 Sản phẩm thời trang cao cấp, thiết kế hiện đại, chất lượng đảm bảo!\n\n` +
              `💎 **Ưu điểm:**\n` +
              `• Chất liệu cao cấp, bền đẹp\n` +
              `• Thiết kế trendy, hợp thời trang\n` +
              `• Dễ phối đồ, phù hợp nhiều dịp\n` +
              `• Giá cả hợp lý, đáng đầu tư\n\n` +
              `🔥 Đừng bỏ lỡ món này nha! 😊`;
  }
  
  return details;
}

// Format order response
function formatOrderResponse(orders: any[]): string {
  if (orders.length === 0) {
    return '🤔 Hmm... Em không tìm thấy đơn hàng nào của bạn...\n\n' +
           'Bạn thử:\n' +
           '✅ Kiểm tra lại mã đơn hàng (VD: FS001)\n' +
           '✅ Xem tất cả đơn trong mục Cá nhân\n\n' +
           'Hoặc bạn muốn đặt đơn mới luôn không? Em tư vấn cho! 😊';
  }
  
  const intro = orders.length === 1 
    ? 'Đây rồi! Em tìm thấy đơn hàng của bạn! 📦✨\n\n'
    : `Bạn có ${orders.length} đơn hàng đây! Em check giúp bạn nhé! 📦✨\n\n`;
  
  return intro + orders.map(order => {
    const statusEmoji = getStatusEmoji(order.status);
    const statusText = getStatusText(order.status);
    const statusNote = getStatusNote(order.status);
    
    return `${statusEmoji} **Đơn ${order.orderNumber}**\n` +
           `   📊 ${statusText} ${statusNote}\n` +
           `   💰 ${order.total.toLocaleString('vi-VN')}đ\n` +
           `   📅 ${new Date(order.createdAt).toLocaleDateString('vi-VN')}\n` +
           `   📦 ${order.items.length} sản phẩm`;
  }).join('\n\n');
}

// Get status emoji
function getStatusEmoji(status: string): string {
  const emojiMap: Record<string, string> = {
    'pending': '⏳',
    'confirmed': '✅',
    'shipping': '🚚',
    'delivered': '📦',
    'cancelled': '❌'
  };
  return emojiMap[status] || '📋';
}

// Get status text
function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'Chờ xác nhận',
    'confirmed': 'Đã xác nhận',
    'shipping': 'Đang giao hàng',
    'delivered': 'Đã giao hàng',
    'cancelled': 'Đã hủy'
  };
  return statusMap[status] || status;
}

// Get status note
function getStatusNote(status: string): string {
  const noteMap: Record<string, string> = {
    'pending': '- Shop đang xử lý nhanh cho bạn!',
    'confirmed': '- Chuẩn bị giao liền nha!',
    'shipping': '- Sắp đến tay bạn rồi!',
    'delivered': '- Đã nhận hàng chưa bạn?',
    'cancelled': '- Có vấn đề gì không?'
  };
  return noteMap[status] || '';
}

// Handle general questions
async function handleGeneralQuestion(question: string, userContext: any): Promise<string> {
  // Greeting
  if (question.match(/^(hi|hello|xin chào|chào|hey)/)) {
    return getWelcomeMessage(userContext);
  }
  
  // Store hours
  if (question.includes('giờ') || question.includes('mở cửa') || question.includes('đóng cửa')) {
    return '⏰ **Giờ làm việc của shop:**\n\n' +
           '🌟 Thứ 2 - Chủ nhật: 8:00 - 22:00\n' +
           '🎊 Cả ngày lễ và Tết luôn nha!\n\n' +
           'Bạn có thể ghé shop bất cứ lúc nào! Em luôn sẵn sàng phục vụ! 💖';
  }
  
  // Shipping
  if (question.includes('giao hàng') || question.includes('ship') || question.includes('vận chuyển')) {
    return '🚚 **Chính sách giao hàng SIÊU ƯU ĐÃI của shop:**\n\n' +
           '📍 **Giao toàn quốc** - Đến tận tay bạn, đảm bảo an toàn!\n\n' +
           '⚡ **Thời gian giao hàng:**\n' +
           '   • Nội thành HN/HCM: 1-2 ngày (Siêu nhanh!)\n' +
           '   • Các tỉnh thành khác: 3-5 ngày\n' +
           '   • Vùng xa: 5-7 ngày\n\n' +
           '💰 **Phí ship:**\n' +
           '   • Chỉ 30.000đ (Rẻ lắm luôn!)\n' +
           '   • 🎁 **FREESHIP** cho đơn từ 500.000đ!\n' +
           '   • 🎁 **FREESHIP** cho khách hàng thân thiết\n\n' +
           '📦 **Đóng gói cẩn thận:**\n' +
           '   • Hộp đẹp, chống nước\n' +
           '   • Kiểm tra kỹ trước khi gửi\n' +
           '   • Có video đóng gói (yên tâm 100%)\n\n' +
           '🎯 **Cam kết:**\n' +
           '   • Giao đúng hẹn\n' +
           '   • Hoàn tiền nếu ship chậm\n' +
           '   • Hỗ trợ 24/7\n\n' +
           '💖 Đặt ngay đi bạn! Em lo ship tận nơi, bạn cứ yên tâm! 😊';
  }
  
  // Payment
  if (question.includes('thanh toán') || question.includes('payment') || question.includes('trả tiền')) {
    return '💳 **Thanh toán siêu tiện lợi:**\n\n' +
           '💵 **COD** - Nhận hàng rồi mới trả tiền (An tâm 100%!)\n' +
           '🏦 **Chuyển khoản** - Giảm thêm 2% đơn từ 1 triệu!\n' +
           '📱 **MoMo/ZaloPay** - Nhanh gọn trong 1 nốt nhạc\n' +
           '💳 **Thẻ tín dụng** - Trả góp 0% lãi suất\n\n' +
           'Chọn cách nào cũng được nha bạn! 😊';
  }
  
  // Return/Exchange
  if (question.includes('đổi') || question.includes('trả') || question.includes('hoàn')) {
    return '🔄 **Chính sách đổi trả cực dễ:**\n\n' +
           '✨ Đổi trả trong **7 ngày** - Không cần lý do!\n' +
           '✨ Sản phẩm còn nguyên tem mác\n' +
           '✨ Chưa qua sử dụng\n' +
           '✨ **MIỄN PHÍ** đổi size/màu\n' +
           '✨ Hoàn tiền 100% nếu lỗi shop\n\n' +
           'Mua hàng thoải mái, không vừa đổi liền! Em lo hết! 💖';
  }
  
  // Contact
  if (question.includes('liên hệ') || question.includes('hotline') || question.includes('số điện thoại')) {
    return '📞 **Liên hệ với em:**\n\n' +
           '☎️ Hotline: **1900-xxxx** (Miễn phí)\n' +
           '📧 Email: support@fashionstore.com\n' +
           '💬 Chat: Em online 8:00-22:00 hàng ngày\n' +
           '📍 Địa chỉ: [Địa chỉ shop]\n\n' +
           'Cần gì cứ inbox em nha! Em rep siêu nhanh! ⚡';
  }
  
  // Promotion
  if (question.includes('khuyến mãi') || question.includes('giảm giá') || question.includes('sale') || question.includes('ưu đãi')) {
    return '🎊 **CHƯƠNG TRÌNH KHUYẾN MÃI KHỦNG HÔM NAY:**\n\n' +
           '🔥 **FLASH SALE - Giảm 50%** toàn bộ BST Thu Đông\n' +
           '   → Áo khoác, áo len, áo nỉ... Toàn món hot!\n' +
           '   → Chỉ còn 2 ngày cuối! Nhanh tay!\n\n' +
           '🔥 **Mua 2 Tặng 1** - Áo thun basic\n' +
           '   → Chọn 2 áo bất kỳ, tặng thêm 1 áo cùng giá trị!\n' +
           '   → Áo cotton 100%, mặc mát, không ra màu\n\n' +
           '🔥 **Freeship toàn quốc** đơn từ 500k\n' +
           '   → Tiết kiệm 30k ship phí!\n' +
           '   → Giao nhanh trong 1-2 ngày\n\n' +
           '🔥 **Tích điểm đổi quà** cực xịn\n' +
           '   → Mua 100k = 10 điểm\n' +
           '   → Đổi voucher, quà tặng, giảm giá\n\n' +
           '🎁 **Quà tặng đặc biệt:**\n' +
           '   • Đơn từ 500k: Tặng túi canvas xinh xắn\n' +
           '   • Đơn từ 1 triệu: Tặng voucher 100k\n' +
           '   • Đơn từ 2 triệu: Tặng áo thun + voucher 200k\n\n' +
           '⏰ **Thời gian:** Chỉ còn 2 ngày cuối!\n' +
           '😱 **Nhanh tay lên bạn ơi!** Hết hàng là mất deal đó!\n' +
           '💬 Bạn muốn mua món gì? Em tư vấn ngay! 😊';
  }
  
  // Size guide
  if (question.includes('size') || question.includes('số đo') || question.includes('vừa không')) {
    return '📏 **TƯ VẤN SIZE CHUẨN 100%:**\n\n' +
           '💁‍♀️ Để em tư vấn size vừa vặn nhất cho bạn, bạn cho em biết:\n\n' +
           '1️⃣ **Chiều cao & Cân nặng** của bạn\n' +
           '   VD: 1m60, 50kg\n\n' +
           '2️⃣ **Phong cách mặc** bạn thích:\n' +
           '   • Rộng rãi, thoải mái (Oversize)\n' +
           '   • Vừa vặn, ôm dáng (Fitted)\n' +
           '   • Hơi rộng một chút (Regular)\n\n' +
           '3️⃣ **Sản phẩm nào** bạn đang xem?\n' +
           '   (Tên hoặc mã sản phẩm)\n\n' +
           '📊 **Bảng size tham khảo:**\n' +
           '   • Size S: 1m50-1m58, 42-50kg\n' +
           '   • Size M: 1m58-1m65, 50-58kg\n' +
           '   • Size L: 1m65-1m70, 58-65kg\n' +
           '   • Size XL: 1m70+, 65kg+\n\n' +
           '✨ **Lưu ý:**\n' +
           '   • Mỗi sản phẩm có số đo chi tiết\n' +
           '   • Em sẽ tư vấn cụ thể cho từng món\n' +
           '   • Đổi size miễn phí nếu không vừa\n\n' +
           '💯 Em đảm bảo tư vấn size chuẩn nhất!\n' +
           '😊 Mặc vừa xinh, không lo đổi trả nha!';
  }
  
  // Style advice
  if (question.includes('phối') || question.includes('mix') || question.includes('mặc') || question.includes('đẹp')) {
    return '👗 **TƯ VẤN PHỐI ĐỒ CHUYÊN NGHIỆP:**\n\n' +
           '💁‍♀️ Bạn muốn phối đồ cho dịp nào nào?\n\n' +
           '👔 **ĐI LÀM VĂN PHÒNG:**\n' +
           '   • Áo sơ mi trắng + Quần tây đen + Giày cao gót\n' +
           '   → Sang trọng, chuyên nghiệp\n' +
           '   • Áo kiểu pastel + Chân váy bút chì + Túi xách\n' +
           '   → Nữ tính, thanh lịch\n\n' +
           '👟 **ĐI CHƠI CUỐI TUẦN:**\n' +
           '   • Áo thun basic + Quần jeans + Sneaker\n' +
           '   → Năng động, trẻ trung\n' +
           '   • Váy babydoll + Sandal + Túi tote\n' +
           '   → Xinh xắn, dễ thương\n\n' +
           '👗 **DỰ TIỆC/SỰ KIỆN:**\n' +
           '   • Váy đầm maxi + Giày cao gót + Clutch\n' +
           '   → Lộng lẫy, nổi bật\n' +
           '   • Jumpsuit + Phụ kiện statement\n' +
           '   → Sang chảnh, hiện đại\n\n' +
           '👕 **MẶC HÀNG NGÀY:**\n' +
           '   • Áo phông + Quần short + Dép sandal\n' +
           '   → Thoải mái, đơn giản\n' +
           '   • Áo len + Quần baggy + Giày thể thao\n' +
           '   → Ấm áp, trendy\n\n' +
           '🎨 **MẸO PHỐI MÀU:**\n' +
           '   • Đen + Trắng = Classic, thanh lịch\n' +
           '   • Pastel + Trắng = Nhẹ nhàng, nữ tính\n' +
           '   • Đỏ + Đen = Nổi bật, quyến rũ\n' +
           '   • Xanh + Trắng = Tươi mát, trẻ trung\n\n' +
           '💕 Bạn cứ nói dịp gì, em mix đồ chi tiết cho bạn liền!\n' +
           '🛍️ Hoặc bạn muốn xem món nào, em gợi ý cách phối luôn! 😊';
  }
  
  // Default response
  return '💖 **Em có thể giúp bạn:**\n\n' +
         '🛍️ Tư vấn sản phẩm - Tìm món đẹp nhất\n' +
         '📦 Tra cứu đơn hàng - Check nhanh\n' +
         '💝 Khuyến mãi hot - Deal cực xịn\n' +
         '👗 Tư vấn phối đồ - Mix sao cho đẹp\n' +
         '📏 Hướng dẫn chọn size - Chuẩn 100%\n' +
         '🚚 Giao hàng & Thanh toán\n' +
         '🔄 Đổi trả dễ dàng\n\n' +
         'Bạn cần em tư vấn gì nào? 😊';
}

// Welcome message
function getWelcomeMessage(userContext: any): string {
  const userName = userContext?.userName || '';
  const greeting = userName ? `Chào ${userName}! 💖` : 'Chào bạn yêu! 💖';
  
  return `${greeting}\n\n` +
         'Em là **Linh** - tư vấn viên thời trang của Fashion Store đây ạ! 🌟\n' +
         'Em rất vui được tư vấn cho bạn hôm nay! ✨\n\n' +
         '🎊 **KHUYẾN MÃI HOT HÔM NAY:**\n' +
         '🔥 Giảm 50% toàn bộ BST Thu Đông\n' +
         '🔥 Mua 2 tặng 1 - Áo thun basic\n' +
         '🔥 Freeship đơn từ 500k\n' +
         '🔥 Tặng voucher 100k cho đơn đầu tiên\n\n' +
         '💁‍♀️ **Em có thể giúp bạn:**\n\n' +
         '🛍️ **Tư vấn sản phẩm** - Bạn cứ nói em sẽ tìm món đẹp nhất!\n' +
         '   • Áo sơ mi công sở sang chảnh\n' +
         '   • Váy đầm dự tiệc lộng lẫy\n' +
         '   • Quần jeans trendy\n' +
         '   • Giày dép thời thượng\n\n' +
         '👗 **Tư vấn phối đồ** - Mix sao cho đẹp & hợp dịp\n' +
         '📏 **Tư vấn size** - Đảm bảo vừa vặn 100%\n' +
         '💝 **Khuyến mãi & Deals** - Săn sale cực đã\n' +
         '📦 **Tra đơn hàng** - Check nhanh trong 1 nốt nhạc\n\n' +
         '💬 Bạn đang tìm món gì? Hoặc cần tư vấn phong cách nào?\n' +
         'Cứ nói thoải mái, em sẽ tư vấn tận tình cho bạn! 😊';
}

// Generate suggestions based on intent
function generateSuggestions(intent: string, userContext: any): string[] {
  switch (intent) {
    case 'search_product':
      return [
        '💝 Có khuyến mãi gì không?',
        '📏 Tư vấn size cho em',
        '👗 Tư vấn phối đồ',
        '🚚 Giao hàng mất bao lâu?'
      ];
    
    case 'product_consultation':
      return [
        '📏 Size nào vừa với em?',
        '👗 Phối đồ thế nào đẹp?',
        '💰 Có giảm giá không?',
        '🛍️ Xem thêm món khác'
      ];
    
    case 'check_order':
      if (userContext) {
        return [
          '🛍️ Mua thêm món khác',
          '🔄 Chính sách đổi trả',
          '📞 Liên hệ hỗ trợ',
          '💝 Xem khuyến mãi'
        ];
      }
      return ['🔐 Đăng nhập để xem đơn'];
    
    case 'general_question':
      return [
        '🛍️ Tìm sản phẩm đẹp',
        '💝 Khuyến mãi hot',
        '👗 Tư vấn phối đồ',
        '📦 Kiểm tra đơn hàng'
      ];
    
    default:
      return [
        '🛍️ Xem sản phẩm mới',
        '💝 Deal hot hôm nay',
        '📦 Tra đơn hàng',
        '💬 Tư vấn thêm'
      ];
  }
}
