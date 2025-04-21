import { AuthProvider } from '../context/AuthContext';
import './globals.css';
import { Poppins } from 'next/font/google'
import Sidebar from '@/components/Sidebar';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'], // choose the weights you need
})

export const metadata = {
  title: 'ToDone',
  description: 'Todo list application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <AuthProvider>
          <Sidebar>
            {children}
          </Sidebar>
        </AuthProvider>
      </body>
    </html>

  )
}