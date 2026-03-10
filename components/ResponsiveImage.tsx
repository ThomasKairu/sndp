import React from 'react';

interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({ 
  src, 
  alt, 
  className, 
  loading = 'lazy',
  ...props 
}) => {
  // src usually looks like "/v2/filename.webp"
  // Optimized images are in "/v2/optimized/filename-WIDTHw.webp"
  
  const generateSrcSet = (originalSrc: string) => {
    if (!originalSrc.startsWith('/v2/') || originalSrc.includes('/optimized/')) {
      return undefined;
    }

    const pathParts = originalSrc.split('/');
    const filenameWithExt = pathParts[pathParts.length - 1];
    const filename = filenameWithExt.split('.')[0];
    
    const widths = [320, 640, 768, 1024, 1280, 1920];
    return widths
      .map(w => `/v2/optimized/${filename}-${w}w.webp ${w}w`)
      .join(', ');
  };

  const optimizedSrc = src.startsWith('/v2/') && !src.includes('/optimized/')
    ? src.replace('/v2/', '/v2/optimized/')
    : src;

  return (
    <img
      src={optimizedSrc}
      srcSet={generateSrcSet(src)}
      alt={alt}
      className={className}
      loading={loading}
      {...props}
    />
  );
};
