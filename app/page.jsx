import Feed from "@components/Feed";

const Home = () => (
  <section className='w-full flex-center flex-col'>
    <h1 className='head_text text-center'>
      Discover & Share
      <br className='max-md:hidden' />
      <span className='orange_gradient text-center'> AI-Charged Prompts</span>
    </h1>
    <p className='desc text-center'>
      Discover, share AI prompts, create and manage your own prompts while searching prompts using both keyword and semantic search
    </p>

    <Feed />
  </section>
);

export default Home;
