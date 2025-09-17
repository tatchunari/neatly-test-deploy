import Sidebar from './Sidebar';

 export type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className='flex flex-col'>
      <Sidebar/>
      {children}
    </div>
  )
}

