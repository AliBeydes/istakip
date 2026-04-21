import './globals.css'

export const metadata = {
  title: 'İş Takip Platformu',
  description: 'Kapsamlı iş takip ve kurumsal işbirliği platformu',
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}
