"use client"
import './globals.css'
// import { Inter } from 'next/font/google'
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

// const inter = Inter({ subsets: ['latin'] })

const RootLayout = ({ children }) => {
    return (
        <html lang="en">
            <head>
                {/* Filter Decrapted "findDOMNode" Warning */}
                <script dangerouslySetInnerHTML={{
                    __html: `
                    const consoleError = console.error.bind(console);
                    console.error = (errObj, ...args) => {
                        if (args.includes('findDOMNode')
                        ) {
                            return;
                        }
                        consoleError(errObj, ...args);
                    };`
                }} />
            </head>

            <body /*className={inter.className}*/>
                <ProgressBar
                    options={{ showSpinner: false }}
                    shallowRouting
                />
                <AntdRegistry>
                    {children}
                </AntdRegistry>
            </body>
        </html>
    );
}

export default RootLayout;
