'use client';
import Navbar from '../components/Navbar';

export default function BlogShell({ children }: { children: React.ReactNode }) {
  const handleTrialClick = () => {
    window.location.href = '/';
  };

  return (
    <>
      <Navbar onTrialClick={handleTrialClick} />
      <main className="blog-main">
        {children}
      </main>
    </>
  );
}
