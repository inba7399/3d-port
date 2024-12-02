
  export const myProjects = [
    
    {
      title: 'Multiplayer Coin Game',
      desc: 'This is a fun and engaging game where anyone can join by visiting the game URL. Players are placed on a shared canvas as soon as they enter and can begin collecting coins, competing, or collaborating for a lively gaming experience!',
      subdesc:
        'The game is built using HTML Canvas for rendering and styled with CSS for a polished look. All functionalities are powered by JavaScript, ensuring a smooth and dynamic experience. Firebase Live Database is used to manage real-time updates, providing seamless interactivity for all players.',
      href: 'https://resplendent-tapioca-2d1faf.netlify.app',
      texture: '/textures/project/project2.mp4',
      logo: '/assets/project-logo2.png',
      logoStyle: {
        backgroundColor: '#13202F',
        border: '0.2px solid #17293E',
        boxShadow: '0px 0px 60px 0px #2F6DB54D',
      },
      spotlight: '/assets/spotlight2.png',
      tags: [
        {
          id: 1,
          name: 'html',
          path: '/assets/html.png',
        },
        {
          id: 2,
          name: 'CSS',
          path: 'assets/css.png',
        },
        {
          id: 3,
          name: 'JavaScript',
          path: '/assets/js.png',
        },
        {
          id: 4,
          name: 'FireBase',
          path: '/assets/firebase.png',
        },
      ],
    },
    {
      title: 'Online counselling App',
      desc: 'This SaaS platform offers seamless online counseling services. Users can book sessions and connect with verified professionals via secure video calls. Licensed professionals can apply to join, and once verified, they are listed on the services page for users to book easily. The platform ensures a user-friendly and efficient experience.',
      subdesc:
        'User data is stored in MongoDB with hashed passwords, and video calls are archived using WebRTC for security and reliability.',
      href: 'https://chic-starlight-bc5789.netlify.app',
      texture: '/textures/project/project1.mp4',
      logo: '/assets/project-logo3.png',
      logoStyle: {
        backgroundColor: '#CBC3E3',
        background:
          'linear-gradient(0deg, #800080,#CBC3E3), linear-gradient(180deg, rgba(160, 32, 240, 0.9) 0%, rgba(160, 32, 240, 0.8) 100%)',
        border: '0.2px solid rgba(208, 213, 221, 1)',
        boxShadow: '0px 0px 60px 0px rgba(160, 32, 240, 0.3)',
      },
      spotlight: '/assets/spotlight5.png',
      tags: [
        {
          id: 1,
          name: 'React.js',
          path: '/assets/react.svg',
        },
        {
          id: 2,
          name: 'MongoDb',
          path: 'assets/mongodb.png',
        },
        {
          id: 3,
          name: 'Express',
          path: '/assets/node.png',
        },
        {
          id: 4,
          name: 'Node',
          path: '/assets/express.png',
        },
      ],
    },
    {
      title: 'Weather App',
      desc: 'This weather app allows users to search for any location and instantly access current weather details. It provides information such as temperature, wind speed, humidity, and more, offering a quick and reliable way to stay updated on local and global weather conditions.',
      subdesc:
        'The app allows users to enter a location, making an API call to fetch real-time weather data. The retrieved details, such as temperature, wind speed, and humidity, are then displayed on the user interface for an up-to-date view of the weather.',
      href: 'https://chic-starlight-bc5789.netlify.app',
      texture: '/textures/project/project3.mp4',
      logo: '/assets/weather-logo.png',
      logoStyle: {
        backgroundColor: '#FFFFED',
        background:
          'linear-gradient(0deg, #FFFFED,#FFFFED), linear-gradient(180deg, rgba(160, 32, 240, 0.9) 0%, rgba(160, 32, 240, 0.8) 100%)',
        border: '0.2px solid rgba(208, 213, 221, 1)',
        boxShadow: '0px 0px 60px 0px rgba(160, 32, 240, 0.3)',
      },
      spotlight: '/assets/spotlight1.png',
      tags: [
        {
          id: 1,
          name: 'html',
          path: '/assets/html.png',
        },
        {
          id: 2,
          name: 'CSS',
          path: 'assets/css.png',
        },
        {
          id: 3,
          name: 'JavaScript',
          path: '/assets/js.png',
        },
        {
          id: 4,
          name: 'tailwind',
          path: '/assets/tailwindcss.png',
        },
      ],
    },
   
  ];
  
  export const calculateSizes = (isSmall, isMobile, isTablet) => {
    return {
      deskScale: isSmall ? 0.05 : isMobile ? 0.06 : 0.065,
      deskPosition: isMobile ? [0.5, -4.5, 0] : [0.25, -5.5, 0],
      cubePosition: isSmall ? [4, -7, 0] : isMobile ? [5, -5, 0] : isTablet ? [8, -7, 0] : [9, -5.5, 0],
      reactLogoPosition: isSmall ? [3, 2, 0] : isMobile ? [5, 4, 0] : isTablet ? [7, 2, 0] : [9, 3, 0],
      ringPosition: isSmall ? [-5, 6, 6] : isMobile ? [-10, 10, 0] : isTablet ? [-15, 5, 0] : [-21, 5, 0],
      targetPosition: isSmall ? [-6, -10, -10] : isMobile ? [-9, -10, -10] : isTablet ? [-11, -7, -10] : [-13, -13, -10],
    };
  };
  
 
