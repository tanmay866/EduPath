const BackgroundAnimation = () => {
  return (
    <div className="animated-bg">
      <div className="moving-shape shape-1"></div>
      <div className="moving-shape shape-2"></div>
      <div className="moving-shape shape-3"></div>
      <div className="moving-shape shape-4"></div>
      <div className="moving-shape shape-5"></div>
      <div className="moving-shape shape-6"></div>
      <div className="moving-shape shape-7"></div>
      <div className="moving-shape shape-8"></div>
      
      <div className="rotating-gradient"></div>
      
      <div className="floating-particle" style={{top: '5%', left: '15%', animationDelay: '0s'}}></div>
      <div className="floating-particle" style={{top: '8%', left: '85%', animationDelay: '2s'}}></div>
      <div className="floating-particle" style={{top: '12%', left: '50%', animationDelay: '1.5s'}}></div>
      <div className="floating-particle" style={{top: '15%', left: '20%', animationDelay: '0s'}}></div>
      <div className="floating-particle" style={{top: '25%', left: '70%', animationDelay: '1s'}}></div>
      <div className="floating-particle" style={{top: '45%', left: '10%', animationDelay: '2s'}}></div>
      <div className="floating-particle" style={{top: '55%', left: '85%', animationDelay: '1.5s'}}></div>
      <div className="floating-particle" style={{top: '75%', left: '30%', animationDelay: '0.5s'}}></div>
      <div className="floating-particle" style={{top: '65%', left: '60%', animationDelay: '2.5s'}}></div>
      <div className="floating-particle" style={{top: '35%', left: '50%', animationDelay: '3s'}}></div>
      <div className="floating-particle" style={{top: '85%', left: '75%', animationDelay: '1.2s'}}></div>
    </div>
  );
};

export default BackgroundAnimation;
