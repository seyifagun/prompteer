import Feed from "@components/Feed";

const Home = () => (
  <section className='w-full flex-center flex-col'>
    <h1 className='head_text text-center'>
      Discover & Share
      <br className='max-md:hidden' />
      <span className='blue_gradient text-center'> AI-Charged Prompts</span>
    </h1>
    <p className='desc text-center'>
      Discover and share AI prompts with intelligent quality analysis, create and manage your prompts with real-time feedback, and find the perfect prompt using advanced semantic search with topic discovery
    </p>

    <Feed />
  </section>
);

export default Home;
