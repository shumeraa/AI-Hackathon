import logo from './logo.svg';
import './App.css';
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
        <div className="text-white text-sm pl-2 pt-10 fade-in-top-2">
        BeHeal is a new AI platform, where current and potential volunteers like you can interact with AI personas affected by Natural Disasters. Through these personas, BeHeal will provide feedback on how you can better respond to those afflicted by Natural Disasters, making them feel safe rather than intimidated or demeaned. Helping them to Be Healed.
        </div>
        <Button text="Get Started" onClick={handleClick} />
      </div>
    </section>
  );
}

export default App;
