import Sidebar from './Sidebar';
import { Toaster } from 'sonner';

 export type LayoutProps = {
  children?: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className='flex overflow-hidden min-h-screen'>
      <Sidebar/>
      <Toaster position="top-right" />
      {children}
    </div>
  )
}

