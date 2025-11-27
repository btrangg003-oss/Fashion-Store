export interface Product {
  id: number
  name: string
  brand: string
  currentPrice: string
  originalPrice: string
  discount: string
  description: string
  features: string[]
  sizes: string[]
  colors: string[]
  images: string[]
  category: string
  rating: number
  reviews: number
  inStock: boolean
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Áo sơ mi trắng cao cấp',
    brand: 'Fashion Store',
    currentPrice: '899.000đ',
    originalPrice: '1.200.000đ',
    discount: '-25%',
    description: 'Áo sơ mi trắng cao cấp được thiết kế từ chất liệu cotton 100% cao cấp, mang lại cảm giác thoải mái và thanh lịch. Phù hợp cho môi trường công sở và các dịp trang trọng.',
    features: [
      'Chất liệu cotton 100% cao cấp',
      'Thiết kế slim fit hiện đại',
      'Kháng khuẩn và thấm hút mồ hôi',
      'Dễ dàng bảo quản và giặt ủi',
      'Màu sắc bền đẹp theo thời gian'
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Trắng', 'Xanh nhạt', 'Hồng nhạt'],
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    category: 'Áo sơ mi',
    rating: 4.8,
    reviews: 124,
    inStock: true
  },
  {
    id: 2,
    name: 'Váy dạ hội sang trọng',
    brand: 'Premium Line',
    currentPrice: '2.499.000đ',
    originalPrice: '3.200.000đ',
    discount: '-22%',
    description: 'Váy dạ hội sang trọng với thiết kế tinh tế, phù hợp cho các buổi tiệc trang trọng và sự kiện đặc biệt. Chất liệu lụa cao cấp tạo nên vẻ đẹp quyến rũ và thanh lịch.',
    features: [
      'Chất liệu lụa cao cấp nhập khẩu',
      'Thiết kế độc quyền từ nhà thiết kế nổi tiếng',
      'Đường may tinh tế và chắc chắn',
      'Phù hợp với nhiều dáng người',
      'Có thể điều chỉnh size theo yêu cầu'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Đen', 'Đỏ burgundy', 'Xanh navy'],
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566479179817-c0b2b2b5b5b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    category: 'Váy đầm',
    rating: 4.9,
    reviews: 89,
    inStock: true
  },
  {
    id: 3,
    name: 'Blazer nam thời trang',
    brand: 'Luxury Collection',
    currentPrice: '1.599.000đ',
    originalPrice: '2.100.000đ',
    discount: '-24%',
    description: 'Blazer nam với thiết kế hiện đại và chất liệu cao cấp, phù hợp cho các dịp quan trọng và môi trường công sở. Thiết kế tailored fit tôn dáng và tạo vẻ lịch lãm.',
    features: [
      'Chất liệu wool cao cấp nhập khẩu',
      'Thiết kế tailored fit tôn dáng',
      'Lót trong silk mềm mại',
      'Khuy áo chất lượng cao',
      'Có thể giặt khô'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Đen', 'Xanh navy', 'Xám'],
    images: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583743089695-4b816a340f82?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    category: 'Áo khoác',
    rating: 4.7,
    reviews: 156,
    inStock: true
  },
  {
    id: 4,
    name: 'Túi xách da thật',
    brand: 'Fashion Store',
    currentPrice: '1.299.000đ',
    originalPrice: '1.800.000đ',
    discount: '-28%',
    description: 'Túi xách da thật cao cấp với thiết kế thanh lịch và tiện dụng, phù hợp cho mọi dịp. Được làm từ da bò thật 100% với craftsmanship tỉ mỉ.',
    features: [
      'Da bò thật 100% cao cấp',
      'Thiết kế đa năng, phù hợp mọi outfit',
      'Ngăn chứa rộng rãi với nhiều túi nhỏ',
      'Khóa kim loại bền bỉ',
      'Dây đeo có thể điều chỉnh'
    ],
    sizes: ['One Size'],
    colors: ['Đen', 'Nâu', 'Đỏ'],
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    category: 'Phụ kiện',
    rating: 4.6,
    reviews: 203,
    inStock: true
  },
  {
    id: 5,
    name: 'Quần jeans slim fit',
    brand: 'Premium Line',
    currentPrice: '799.000đ',
    originalPrice: '1.100.000đ',
    discount: '-27%',
    description: 'Quần jeans slim fit với chất liệu denim cao cấp, tạo dáng hoàn hảo và thoải mái khi mặc. Thiết kế hiện đại phù hợp với mọi phong cách.',
    features: [
      'Chất liệu denim cao cấp từ Nhật Bản',
      'Thiết kế slim fit hiện đại',
      'Co giãn tự nhiên, thoải mái',
      'Bền màu theo thời gian',
      'Dễ dàng phối đồ'
    ],
    sizes: ['28', '29', '30', '31', '32', '33', '34'],
    colors: ['Xanh đậm', 'Xanh nhạt', 'Đen'],
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    category: 'Quần',
    rating: 4.5,
    reviews: 178,
    inStock: true
  },
  {
    id: 6,
    name: 'Áo khoác dạ nữ',
    brand: 'Luxury Collection',
    currentPrice: '1.899.000đ',
    originalPrice: '2.500.000đ',
    discount: '-24%',
    description: 'Áo khoác dạ nữ với thiết kế thanh lịch và chất liệu ấm áp, hoàn hảo cho mùa đông. Thiết kế oversized trendy và chất liệu dạ cao cấp.',
    features: [
      'Chất liệu dạ cao cấp từ Ý',
      'Lót lông cừu ấm áp',
      'Thiết kế oversized thời trang',
      'Khóa kéo YKK chất lượng cao',
      'Túi trong tiện dụng'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Đen', 'Xám', 'Camel'],
    images: [
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    category: 'Áo khoác',
    rating: 4.8,
    reviews: 142,
    inStock: true
  },
  {
    id: 7,
    name: 'Giày cao gót thanh lịch',
    brand: 'Fashion Store',
    currentPrice: '1.199.000đ',
    originalPrice: '1.600.000đ',
    discount: '-25%',
    description: 'Giày cao gót với thiết kế thanh lịch và chất liệu da cao cấp, tạo nên vẻ đẹp quyến rũ. Đế cao 7cm vừa phải, thoải mái cho cả ngày dài.',
    features: [
      'Da thật cao cấp từ Italia',
      'Đế cao 7cm thoải mái',
      'Thiết kế thanh lịch, sang trọng',
      'Đệm êm ái chống mỏi chân',
      'Bền bỉ theo thời gian'
    ],
    sizes: ['35', '36', '37', '38', '39', '40'],
    colors: ['Đen', 'Nude', 'Đỏ'],
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    category: 'Giày',
    rating: 4.4,
    reviews: 98,
    inStock: true
  },
  {
    id: 8,
    name: 'Đầm cocktail đen',
    brand: 'Premium Line',
    currentPrice: '1.799.000đ',
    originalPrice: '2.300.000đ',
    discount: '-22%',
    description: 'Đầm cocktail đen với thiết kế tinh tế và chất liệu cao cấp, hoàn hảo cho các buổi tiệc. Thiết kế ôm dáng tôn lên đường cong cơ thể.',
    features: [
      'Chất liệu lụa cao cấp',
      'Thiết kế ôm dáng tôn đường cong',
      'Đường may tinh tế, chắc chắn',
      'Phù hợp nhiều dáng người',
      'Dễ dàng bảo quản'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Đen', 'Xanh navy', 'Đỏ rượu'],
    images: [
      'https://images.unsplash.com/photo-1566479179817-c0b2b2b5b5b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    category: 'Váy đầm',
    rating: 4.7,
    reviews: 134,
    inStock: true
  }
]

export const getProductById = (id: number): Product | undefined => {
  return products.find(product => product.id === id)
}

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(product => 
    product.category.toLowerCase().includes(category.toLowerCase())
  )
}

export const searchProducts = (query: string): Product[] => {
  const searchTerm = query.toLowerCase()
  return products.filter(product =>
    product.name.toLowerCase().includes(searchTerm) ||
    product.brand.toLowerCase().includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm)
  )
}