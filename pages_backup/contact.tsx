import { NextSeo } from 'next-seo'
import Layout from '../components/Layout/Layout'
import ContactHero from '../components/Contact/ContactHero'
import ContactForm from '../components/Contact/ContactForm'
import ContactInfo from '../components/Contact/ContactInfo'
import ContactMap from '../components/Contact/ContactMap'

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