"use client";

export const SkillsContainer = () => {
  const skills = [
    { src: '/images/assist.webp', alt: 'Assist' },
    { src: '/images/attack.webp', alt: 'Attack' },
    { src: '/images/dodge.webp', alt: 'Dodge' },
    { src: '/images/ulti.webp', alt: 'Ultimate' },
    { src: '/images/skill.webp', alt: 'Skill' }
  ];

  return (
    <div style={{
      position: 'absolute',
      right: '-400px',
      top: '85%',
      transform: 'translateY(-50%)',
      display: 'flex',
      flexDirection: 'row',
      gap: '35px',
      zIndex: 2,
    }}>
      {skills.map((skill, index) => (
        <div 
          key={index} 
          style={{
            width: '80px',
            height: '80px',
            cursor: 'pointer',
            opacity: 0.7,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.7';
          }}
        >
          <img
            src={skill.src}
            alt={skill.alt}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default SkillsContainer;
