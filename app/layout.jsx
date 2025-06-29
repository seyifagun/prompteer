import "@styles/globals.css";

import Nav from "@components/Nav";
import Provider from "@components/Provider";

export const metadata = {
  title: "Prompteer",
  description: "Discover, share AI prompts, create and manage your own prompts while searching prompts using both keyword and semantic search",
};

const RootLayout = ({ children }) => (
  <html lang='en'>
    <head>
      <link rel="icon" href="/assets/icons/favicon.ico" />
    </head>
    <body>
      <Provider>
        <div className='main'>
          <div className='gradient' />
        </div>

        <main className='app'>
          <Nav />
          {children}
        </main>
      </Provider>
    </body>
  </html>
);

export default RootLayout;
