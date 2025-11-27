import HeaderSimple from './HeaderSimple'
import Footer from './Footer'

export default function LayoutSimple({ children }) {
  return (
    <>
      <HeaderSimple />
      <main style={{ minHeight: '60vh' }}>{children}</main>
      <Footer />
    </>
  )
}
