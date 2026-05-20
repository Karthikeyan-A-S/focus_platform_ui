import Navbar from './Navbar';

export default function MainLayout({ children }) {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            
            {/* The active page content gets injected into this main tag */}
            <main style={{ flex: 1, paddingBottom: '40px' }}>
                {children}
            </main>
        </div>
    );
}