export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html>
            <body>
                <main>
                    <nav>
                    </nav>
                    {children}
                </main>
            </body>
        </html>
    );
}