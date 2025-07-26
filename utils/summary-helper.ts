export const parseSection = (
    section: string
  ): { title: string; points: string[] } => {
    const [titleLine, ...content] = section.split('\n');
  
    const cleanTitle = titleLine.startsWith('#')
      ? titleLine.substring(1).trim()
      : titleLine.trim();
  
    
    const bulletPoints = content
      .map(line => line.trim())
      .filter(line => line.startsWith('•'))
      .map(line => line.slice(1).trim());
  

    const fallback = content
      .map(line => line.trim())
      .filter(Boolean)
      .join(' ');
  
    const points = bulletPoints.length > 0 ? bulletPoints : [fallback];
  
    return {
      title: cleanTitle,
      points,
    };
};
  