import IsConnected from '@/components/IsConnected'
import PageTitle from '@/components/layout/PageTitle'

const Home = () => {
  return (
    <IsConnected>
      <PageTitle>Homepage</PageTitle>

      <div className='w-1/2 mx-auto my-10 text-justify text-xl font-semibold text-indigo-200'>
        <p className='p-4'>Hey there, music maestros and groove gurus! 🎵</p>
        
        <p className='p-4'>
          Wanna rock the music world like a superstar without breaking the bank? Tune Together is your backstage pass to create, connect, and celebrate music in a whole new way! 🤩
        </p>
        
        <p className='p-4'>
          Fund your projects, groove with your fans, and unleash your creative genius with our funky-fresh platform. Join the jam, feel the beat, and let&apos;s make sweet music together! 🎶🚀
        </p>
      </div>
    </IsConnected>
  )
}
export default Home