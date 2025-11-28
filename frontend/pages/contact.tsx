import { NextSeo } from 'next-seo'
import Layout from '../src/components/layout/Layout'
import ContactHero from '../src/components/Contact/ContactHero'
import ContactForm from '../src/components/Contact/ContactForm'
import ContactInfo from '../src/components/Contact/ContactInfo'
import ContactMap from '../src/components/Contact/ContactMap'

export default function Contact() {
  return (
    <Layout>
      <NextSeo
        title="Liên hệ - Fashion Store | Hỗ trợ khách hàng 24/7"
        description="Liên hệ với Fashion Store để được tư vấn và hỗ trợ. Chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc của bạn về sản phẩm và dịch vụ."
        canonical="https://fashionstore.com/contact"
        openGraph={{
          title: 'Liên hệ - Fashion Store',
          description: 'Liên hệ với Fashion Store để được tư vấn và hỗ trợ.',
          url: 'https://fashionstore.com/contact',
        }}
      />
      <ContactHero />
      <ContactInfo />
      <ContactForm />
      <ContactMap />
    </Layout>
  )
}