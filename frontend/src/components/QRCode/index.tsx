import { FC, useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';

const CopyableQRCode: FC<any> = ({ value, height, ...props }) => {
  const canvasRef = useRef(null);
  const svgRef = useRef(null); // Reference to the QRCode's SVG
  const [imageSrc, setImageSrc] = useState('');

  useEffect(() => {
    if (!svgRef.current) return;

    // Get the SVG content
    const svg = svgRef.current;
    const canvas: any = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Convert the canvas to a base64 image URL
      const dataURL = canvas.toDataURL('image/png');
      setImageSrc(dataURL);
    };

    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.src = url;

    return () => URL.revokeObjectURL(url); // Clean up the object URL
  }, [value]);

  return (
    <div>
      {/* Render the QR Code SVG invisibly */}
      <div style={{ display: 'none' }}>
        {!!value && <QRCode ref={svgRef} value={value} {...props} />}
      </div>

      {/* Hidden Canvas (for processing only) */}
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      {/* Display the Image */}
      {imageSrc && <img src={imageSrc} alt="QR Code" style={{ cursor: 'pointer', height }} />}
    </div>
  );
};

export default CopyableQRCode;
