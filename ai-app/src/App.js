import logo from './logo.svg';
import Button from './components/Button.js';

function App() {
  const handleClick = () => {
    alert("Button clicked!");
  };
  return (
    <section className="bg-primaryPurple h-screen font-lexend ">
      <div className="gradientText text-2xl p-2">
        BeHeal
      </div>
      <div className="absolute top-1/4 left-1/4 w-1/2 fade-in-top hover-fade">
        <div className="text-lg text-white pl-2">
          welcome to 
        </div>
        <div className="gradientText text-8xl">
          BeHeal
        </div>
        <div className="text-white text-sm pl-2 pt-10 mb-12 fade-in-top-2">
        BeHeal is the new AI-Powered platform built for volunteers to practice real-life conversations with natural disaster survivors. Engage with lifelike personas, receive feedback on how your words impact survivors' mental well-being, and build skills to provide comfort and understanding when it’s needed most. Let's create a safer, more compassionate world together.
        </div>
        <Button text="Get Started" link="/Personas" />
      </div>
    </section>
  );
}

export default App;
