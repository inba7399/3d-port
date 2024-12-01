import React,{useState} from 'react'
import Globe from 'react-globe.gl'
import Button from '../components/Button'


const About = () => {
    const [hasCopied, setHasCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText('inbasagar7@gmail.com');
      setHasCopied(true);
  
      setTimeout(() => {
        setHasCopied(false);
      }, 2000);
    };
  return (
    <section className='c-space my-20'>
      <div className='grid xl:grid-cols-3 xl:grid-rows-6 md:grid-cols-2 grid-cols-1 gap-5 h-full'>
        <div className='col-span-1 xl:row-span-3'>
           <div className='grid-container'>
             <img src="/assets/grid1.png" alt="grid-1"  className='w-full sm:h-[276px] h-fit object-contain'/> 
             <div>
                <p className='grid-headtext'>Hi, i'am Inba sagar</p>
                <p className='grid-subtext'> I have done a lot of web apps.
            using Next,Three,React... and Express,mongoDB,fire base... for backend
                </p>
             </div>
            </div>   
        </div>
        <div className="col-span-1 xl:row-span-3">
          <div className="grid-container">
            <img src="assets/grid2.png" alt="grid-2" className="w-full sm:h-[276px] h-fit object-contain" />
            <div>
              <p className="grid-headtext">Tech Stack</p>
              <p className="grid-subtext">
                I specialize in a variety of languages, frameworks, and tools that allow me to build robust and scalable
                applications
              </p>
            </div>
          </div>
        </div>
        <div className="col-span-1 xl:row-span-4">
          <div className="grid-container">
            <div className="rounded-3xl w-full sm:h-[326px] h-fit flex justify-center items-center">
              <Globe
                height={326}
                width={326}
                backgroundColor="rgba(0, 0, 0, 0)"
                backgroundImageOpacity={0.5}
                showAtmosphere
                showGraticules
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                labelsData={[{ lat: 11, lng: 78, text: 'Tamil Nadu, India', color: 'white', size: 15 }]}
              />
            </div>
            <div>
              <p className="grid-headtext">I'm very flexible with time zone communications & locations</p>
              <p className="grid-subtext">I'm based in Tamil Nadu, India and open to remote work worldwide.</p>
              <div className='xl:mt-10 lg:mt-5'>
              <Button name="Contact Me" widthPercentage='60'/>
              </div>
            </div>
          </div>
        </div>
        <div className="xl:col-span-2 xl:row-span-3">
          <div className="grid-container">
            <img src="assets/grid3.png" alt="grid-3" className="w-full sm:h-[266px] h-fit object-contain" />

            <div>
              <p className="grid-headtext">My Passion for Coding</p>
              <p className="grid-subtext">
              As a digital marketer, I was not that interested in it, though then I had to work on WordPress.
              For a client, at first I used to write simple JS snippets for some elements and
              That's how I became a coder.
              </p>
            </div>
          </div>
        </div>
        <div className="xl:col-span-1 xl:row-span-2 md:col-span-2 md:row-span-6">
          <div className="grid-container">
            <img
              src="assets/grid4.png"
              alt="grid-4"
              className="w-full md:h-[150px] md:w-[800px] sm:h-[276px] h-fit object-cover sm:object-top"
            />

            <div className="space-y-2 ">
              <p className="grid-subtext text-center">Contact me</p>
              <div className="copy-container" onClick={handleCopy}>
                <img src={hasCopied ? 'assets/tick.svg' : 'assets/copy.svg'} alt="copy" />
                <p className="lg:text-2xl md:text-xl font-medium text-gray_gradient text-white">inbasagar7@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About