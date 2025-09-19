import Sidebar from './Sidebar';

 export type LayoutProps = {
  children?: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className='flex overflow-hidden'>
      <Sidebar/>
      {children}
    </div>
  )
}

