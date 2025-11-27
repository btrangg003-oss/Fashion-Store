// AI Chatbot Service for Fashion Store

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatbotContext {
    products?: any[];
    orders?: any[];
    userInfo?: any;
}

export class ChatbotService {
    private apiKey: string;
    private systemPrompt: string;

    constructor() {
        this.apiKey = process.env.OPENAI_API_KEY || '';
        this.systemPrompt = this.buildSystemPrompt();
    }

    private buildSystemPrompt(): string {
        return `Bạn là trợ lý AI thông minh của Fashion Store - một cửa hàng thời trang trực tuyến tại Việt Nam.

THÔNG TIN CỬA HÀNG:
- Tên: Fashion Store
- Chuyên: Thời trang nam, nữ, phụ kiện
- Website: fashionstore.com
- Email hỗ trợ: support@fashionstore.com
- Hotline: 1900-xxxx
- Giờ làm việc: 8:00 - 22:00 (Thứ 2 - Chủ nhật)

PHƯƠNG THỨC THANH TOÁN:
1. Chuyển khoản ngân hàng Vietcombank
   - STK: 1057925369
   - Chủ TK: FASHION STORE
   - Quét QR để thanh toán nhanh
   
2. Ví MoMo
   - SĐT: 0372895004
   - Quét QR trong app MoMo
   
3. COD (Thanh toán khi nhận hàng)
   - Thanh toán tiền mặt khi nhận hàng

CHÍNH SÁCH:
- Miễn phí vận chuyển đơn từ 500.000đ
- Đổi trả trong 7 ngày nếu lỗi sản phẩm
- Bảo hành 30 ngày
- Kiểm tra hàng trước khi thanh toán (COD)

SẢN PHẨM CHÍNH:
- Áo thun nam/nữ: 299.000đ - 599.000đ
- Áo sơ mi: 399.000đ - 799.000đ
- Quần jeans: 499.000đ - 899.000đ
- Áo khoác: 699.000đ - 1.299.000đ
- Váy đầm: 499.000đ - 999.000đ
- Phụ kiện: 99.000đ - 299.000đ

NHIỆM VỤ CỦA BẠN:
1. Tư vấn sản phẩm: giúp khách hàng tìm sản phẩm phù hợp theo nhu cầu, ngân sách
2. Hướng dẫn mua hàng: từng bước đặt hàng, thanh toán chi tiết
3. Tra cứu đơn hàng: kiểm tra trạng thái, vận chuyển
4. Giải đáp thắc mắc: về sản phẩm, chính sách, thanh toán
5. Hỗ trợ kỹ thuật: lỗi website, thanh toán, đăng nhập
6. Gợi ý phối đồ: tư vấn cách mix & match

CÁCH TRẢ LỜI:
- Thân thiện, nhiệt tình, chuyên nghiệp như nhân viên bán hàng thật
- Ngắn gọn, dễ hiểu, có cấu trúc rõ ràng
- Sử dụng emoji phù hợp 😊 🛍️ ✨ 👕 👗 👖
- Đưa ra gợi ý cụ thể với giá cả, màu sắc, size
- Hỏi lại nếu cần thêm thông tin để tư vấn tốt hơn
- Luôn đề xuất 2-3 lựa chọn cho khách hàng
- Nếu không có sản phẩm chính xác, gợi ý sản phẩm tương tự

LƯU Ý QUAN TRỌNG:
- KHÔNG nói "hết hàng" trừ khi chắc chắn 100%
- Nếu không thấy sản phẩm trong danh sách, vẫn tư vấn dựa trên kiến thức chung
- Luôn lịch sự và tôn trọng khách hàng
- Không đưa ra thông tin sai lệch về giá
- Ưu tiên giải pháp nhanh nhất cho khách hàng
- Khuyến khích khách hàng xem thêm trên website để có nhiều lựa chọn hơn`;
    }

    async chat(messages: ChatMessage[], context?: ChatbotContext): Promise<string> {
        try {
            // Build context-aware system prompt
            let enhancedSystemPrompt = this.systemPrompt;

            if (context?.products && context.products.length > 0) {
                enhancedSystemPrompt += `\n\nSẢN PHẨM HIỆN CÓ:\n${this.formatProducts(context.products)}`;
            }

            if (context?.userInfo) {
                enhancedSystemPrompt += `\n\nTHÔNG TIN KHÁCH HÀNG:\n- Tên: ${context.userInfo.name}\n- Email: ${context.userInfo.email}`;
            }

            if (context?.orders && context.orders.length > 0) {
                enhancedSystemPrompt += `\n\nĐƠN HÀNG GẦN ĐÂY:\n${this.formatOrders(context.orders)}`;
            }

            const fullMessages: ChatMessage[] = [
                { role: 'system', content: enhancedSystemPrompt },
                ...messages
            ];

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: fullMessages,
                    temperature: 0.7,
                    max_tokens: 500,
                    top_p: 1,
                    frequency_penalty: 0,
                    presence_penalty: 0
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời lúc này.';

        } catch (error) {
            console.error('Chatbot error:', error);
            return 'Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau hoặc liên hệ hotline 1900-xxxx để được hỗ trợ trực tiếp.';
        }
    }

    private formatProducts(products: any[]): string {
        return products.slice(0, 10).map(p => {
            const inStock = p.stock > 0 && p.status === 'active';
            const stockInfo = inStock ? `Còn ${p.stock} sản phẩm` : 'Hết hàng';
            const category = p.categoryId || p.category || 'Thời trang';
            return `- ${p.name}: ${p.price.toLocaleString('vi-VN')}đ (${category}) - ${stockInfo}`;
        }).join('\n');
    }

    private formatOrders(orders: any[]): string {
        return orders.slice(0, 5).map(o =>
            `- Đơn #${o.id}: ${o.status} - ${o.total.toLocaleString('vi-VN')}đ (${new Date(o.createdAt).toLocaleDateString('vi-VN')})`
        ).join('\n');
    }

    // Quick responses for common questions
    getQuickResponses(): { question: string; answer: string }[] {
        return [
            {
                question: 'Làm sao để đặt hàng?',
                answer: 'Để đặt hàng, bạn chỉ cần: 1️⃣ Chọn sản phẩm yêu thích 2️⃣ Thêm vào giỏ hàng 3️⃣ Điền thông tin giao hàng 4️⃣ Chọn phương thức thanh toán 5️⃣ Xác nhận đơn hàng. Rất đơn giản! 😊'
            },
            {
                question: 'Có những phương thức thanh toán nào?',
                answer: 'Chúng tôi hỗ trợ 3 phương thức: 💳 Chuyển khoản Vietcombank (STK: 1057925369), 📱 Ví MoMo (0372895004), 💵 COD - Thanh toán khi nhận hàng'
            },
            {
                question: 'Bao lâu thì nhận được hàng?',
                answer: 'Thời gian giao hàng: 🏙️ Nội thành: 1-2 ngày, 🌆 Ngoại thành: 2-3 ngày, 🏞️ Tỉnh xa: 3-5 ngày. Miễn phí ship cho đơn từ 500.000đ!'
            },
            {
                question: 'Chính sách đổi trả như thế nào?',
                answer: 'Bạn có thể đổi trả trong 7 ngày nếu: ❌ Sản phẩm lỗi, 📦 Giao sai hàng, 📏 Không đúng size. Sản phẩm phải còn nguyên tem mác và chưa qua sử dụng.'
            },
            {
                question: 'Làm sao để kiểm tra đơn hàng?',
                answer: 'Bạn có thể kiểm tra đơn hàng bằng cách: 🔐 Đăng nhập tài khoản → 📋 Vào mục "Đơn hàng của tôi" → 👀 Xem chi tiết và trạng thái đơn hàng'
            }
        ];
    }
}

export const chatbotService = new ChatbotService();
