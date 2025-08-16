import { useEffect, useState } from 'react';

import { useViewModel } from '../provider/ViewModel';
import { Link } from 'react-router-dom';

const BG_COLOR: Record<number, string> = {
  64: 'bg-blue-400',
};

export const SeatMap = () => {
  const [sheet, setSheet] = useState<any[][]>([]);
  const { appInfo } = useViewModel();

  const updateSeatmap = async () => {
    try {
      const response = await fetch(
        `${appInfo.serverAddress}/seatmap/${appInfo.meetingId}`,
      );

      const result = await response.json();
      setSheet(result.sheet);
    } catch (ex) {
      console.error(ex);
    }
  };

  useEffect(() => {
    updateSeatmap();
    const interval = setInterval(() => {
      updateSeatmap();
    }, 2000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  let attendedBgColor = '#FF0000';
  sheet.forEach((row) => {
    row.forEach((cell) => {
      if (cell && !Number.isNaN(cell.value) && cell.fill?.pattern === 'solid') {
        attendedBgColor = '#' + cell.fill?.fgColor.argb.substring(2); 
      }
    })
  });

  return (
    <div className="container mx-auto flex items-center justify-start h-full">
      <div className="absolute top-0 left-0 w-screen h-screen">
        <figure className="w-full h-full">
          <img
            src="/images/seatbg.jpg"
            alt="Background"
            className="object-contain w-full h-full"
          />
        </figure>
      </div>

      <div className="absolute top-0 left-0 w-screen h-screen flex">
        <div className="flex w-full h-full items-center justify-center">
          <table>
            <tbody>
              {sheet.map((row, index) => {
                return (
                  <tr key={index}>
                    {row.map((cell, index) => {
                      if (cell) {
                        let value = cell.value;
                        
                        if (value === 'X') {
                          let backgroundColor = '#' + cell.fill?.fgColor.argb.substring(2);
                          return (
                            <td
                              key={index}
                              className="w-24 h-16 p-1 text-2xl font-bold text-center text-amber-600 text-yellow-200 border-gray-600 border-solid border-2"
                              style={{ background: backgroundColor }}
                            >
                            </td>
                          );
                        } else if (cell.attended) {
                          return (
                            <td
                              key={index}
                              className="w-24 h-16 p-1 text-2xl font-bold text-center text-amber-600 text-yellow-200 border-gray-600 border-solid border-2"
                              style={{ background: attendedBgColor }}
                            >
                              {value}
                            </td>
                          );
                        } else {
                          return (
                            <td
                              key={index}
                              className="w-24 h-16 p-1 text-2xl font-bold text-center text-amber-600 border-gray-600 border-solid border-2"
                            >
                              {value}
                            </td>
                          );
                        }
                      }
                      return <td key={index} className="w-32 h-16 p-1"></td>;
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// .seatmap td {
//   width: 3rem;
//   height: 3rem;
//   padding: 1rem;
//   border: solid 1pt #00000080;
//   color: #ffbf00;
//   font-weight: bold;
//   font-size: 2rem;
//   text-align: center;
// }

// .seatmap td.empty {
//   border: none;
//   width: 6rem;
//   height: 3rem;
// }

// .seatmap td.attended {
//   background-color: #FA003F;
//   color: #FEED29;
// }
