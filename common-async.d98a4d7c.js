(("undefined"!=typeof globalThis?globalThis:self)["makoChunk_ant-design-pro"]=("undefined"!=typeof globalThis?globalThis:self)["makoChunk_ant-design-pro"]||[]).push([["common"],{"544ebdf1":function(e,t,n){"use strict";n.d(t,"__esModule",{value:!0}),n.e(t,{getAPIURL:function(){return u;},getCheckInLink:function(){return a;},getPhotoURL:function(){return o;}});var r=n("eb5e15c7");let u=e=>r.API_BASE_URL+"/"+e,a=e=>{let t=encodeURIComponent(btoa(e));return console.log(r.CHECKIN_BASEURL),r.CHECKIN_BASEURL+"/"+t;},o=e=>r.PHOTO_BASE_URL+"/"+e;},"8133fd28":function(e,t,n){"use strict";n.d(t,"__esModule",{value:!0}),n.e(t,{AttedanceStatusOptions:function(){return o;},AttendanceStatus:function(){return u;},addAttendance:function(){return s;},attendances:function(){return c;},removeAttendances:function(){return d;},updateAttendance:function(){return i;}});var r,u,a=n("1bef6ecc");(r=u||(u={}))[r.UNKNOWN=0]="UNKNOWN",r[r.CHECKED_IN=1]="CHECKED_IN";let o=[{label:"Ch\u01B0a tham d\u1EF1",value:0},{label:"\u0110\xe3 tham d\u1EF1",value:1}];function c(e){return async(t,n,r)=>{(r=r||{}).meetingId=e;let u={...t,...r};if(n){let e=Object.entries(n)[0];e&&(u.sort=e[0],u.direction=e[1]);}return(0,a.request)("/attendance",{method:"GET",params:u});};}async function i(e,t){return(0,a.request)(`/attendance/${e._id}`,{data:e,method:"PUT",...t||{}});}async function s(e,t){return(0,a.request)("/attendance",{data:e,method:"POST",...t||{}});}async function d(e,t){return(0,a.request)("/attendance",{data:e,method:"DELETE",...t||{}});}},"855cf467":function(e,t,n){"use strict";n.d(t,"__esModule",{value:!0}),n.e(t,{addGuest:function(){return o;},guests:function(){return u;},removeGuests:function(){return c;},search:function(){return i;},updateGuest:function(){return a;}});var r=n("1bef6ecc");async function u(e,t,n){let u={...e,...n};if(t){let e=Object.entries(t)[0];e&&(u.sort=e[0],u.direction=e[1]);}return(0,r.request)("/guest",{method:"GET",params:u});}async function a(e,t){return(0,r.request)(`/guest/${e._id}`,{data:e,method:"PUT",...t||{}});}async function o(e,t){return(0,r.request)("/guest",{data:e,method:"POST",...t||{}});}async function c(e,t){return(0,r.request)("/guest",{data:e,method:"DELETE",...t||{}});}async function i(e,t,n){return await (0,r.request)("/guest/search",{params:{q:e,c:t},method:"GET",...n||{}});}},dc39d580:function(e,t,n){"use strict";function r(e,t,n){return{value:t,onChange:r=>{JSON.stringify(r)!==JSON.stringify(t)&&(n(r),localStorage.setItem(e,JSON.stringify(r)));},persistenceKey:e,persistenceType:"localStorage"};}n.d(t,"__esModule",{value:!0}),n.d(t,"tableColumnState",{enumerable:!0,get:function(){return r;}});},e0614a8c:function(e,t,n){"use strict";n.d(t,"__esModule",{value:!0}),n.e(t,{addMeeting:function(){return i;},generateInviteSheet:function(){return d;},getMeeting:function(){return a;},getMeetingReport:function(){return o;},meetings:function(){return u;},removeMeetings:function(){return s;},updateMeeting:function(){return c;}});var r=n("1bef6ecc");async function u(e,t,n){let u={...e,...n};if(t){let e=Object.entries(t)[0];e&&(u.sort=e[0],u.direction=e[1]);}return(0,r.request)("/meeting",{method:"GET",params:u});}async function a(e){return await (0,r.request)(`/meeting/${e}`,{method:"GET",params:{}});}async function o(e){return(await (0,r.request)(`/meeting/report/${e}`,{method:"GET",params:{}})).data;}async function c(e,t){return(0,r.request)(`/meeting/${e._id}`,{data:e,method:"PUT",...t||{}});}async function i(e,t){return(0,r.request)("/meeting",{data:e,method:"POST",...t||{}});}async function s(e,t){return(0,r.request)("/meeting",{data:e,method:"DELETE",...t||{}});}async function d(e){return(await (0,r.request)(`/meeting/generate/${e}`,{method:"GET",params:{}})).data;}}}]);
//# sourceMappingURL=common-async.d98a4d7c.js.map