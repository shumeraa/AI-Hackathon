import logo from './logo.svg';
import Button from './components/Button.js';
import Elma from './assets/elma.png';
import Harry from './assets/harry.png';
import Wilma from './assets/wilma.png';

function Personas() {
  return (
    <section className="bg-primaryPurple h-screen font-lexend ">
      <div className="gradientText text-2xl p-2">
        BeHeal
      </div>
      <div className="absolute fade-in-top hover-fade text-center" style={{top: "10%", left:"10%", width:"80%"}}>
        <div className="text-lg text-white pl-2">
          choose a 
        </div>
        <div className="gradientText text-8xl mx-auto">
          Persona
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-4 justify-center mt-8">
          <div className="mx-auto flex flex-col items-center">
            <img
              src={Wilma}
              alt="Wilma"
              className="w-44 h-44 rounded-lg"
            />
            <div className="text-white text-lg">
              Wendy Wildfire
            </div>
            <div className="text-gray-400 text-xs max-w-52 fade-in-top-2">
              Wendy lived in central California for 40 years before her beloved home was burnt to a crisp by a wildfire. Any help is welcome.
            </div>
            <Button text="Start Chatting" />
          </div>
          <div className="mx-auto flex flex-col items-center">
            <img
              src={Elma}
              alt="Elma"
              className="w-44 h-44 rounded-lg"
            />
            <div className="text-white text-lg">
              Elma Earthquake
            </div>
            <div className="text-gray-400 text-xs max-w-52 fade-in-top-2">
              Elma is a mother of two and her home has been destroyed by an earthquake. Please try and comfort her.
            </div>
            <Button text="Start Chatting" link="/Chat" />
          </div>
          <div className="mx-auto flex flex-col items-center">
            <img
              src={Harry}
              alt="Harry"
              className="w-44 h-44 rounded-lg"
            />
            <div className="text-white text-lg">
              Harry Hurricane
            </div>
            <div className="text-gray-400 text-xs max-w-52 fade-in-top-2">
              Harry was forced to leave everything behind except his dog in the wake of a hurricane. Help him to navigate his emotions.
            </div>
            <Button text="Start Chatting" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Personas;
