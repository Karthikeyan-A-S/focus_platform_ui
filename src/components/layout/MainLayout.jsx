import Navbar from './Navbar';

export default function MainLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col bg-[var(--bg)]">
            <Navbar />
            <main className="flex-1 pb-10">{children}</main>
        </div>
    );
}
