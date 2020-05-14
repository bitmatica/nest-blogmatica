(this["webpackJsonpblogmatica-mst-apollo"]=this["webpackJsonpblogmatica-mst-apollo"]||[]).push([[0],{104:function(e,n,t){"use strict";t.r(n);var a=t(0),r=t.n(a),o=t(63),i=t.n(o),l=t(35),u=t(34),c=t(18),s=t(14),m=t(42),d=t(81),v=t(80),p=t(16),f=t(64),g=t(67),b="".concat("todoapp","_jwt");function E(e){sessionStorage.setItem(b,e)}var h=t(111),O=Object(s.a)(Object(s.a)({},h.a),{},{breakpoints:["30em","48em","62em","80em"],fonts:{heading:'"Avenir Next", sans-serif',body:"system-ui, sans-serif",mono:"Menlo, monospace"},colors:Object(s.a)(Object(s.a)({},h.a.colors),{},{primary:"purple"}),buttons:{variants:{primary:{maxWidth:"120px",color:"white",bg:"primary"}}},fontSizes:Object(s.a)(Object(s.a)({},h.a.fontSizes),{},{xs:"0.75rem",sm:"0.875rem",md:"1rem",lg:"1.125rem",xl:"1.25rem","2xl":"1.5rem","3xl":"1.875rem","4xl":"2.25rem","5xl":"3rem","6xl":"4rem"})}),j=t(41),w=t(114),y=t(49),U=y.a.model("CurrentUser",{id:"",email:""}).actions((function(e){return{updateUser:function(n){var t=n.id,a=n.email;e.id=t||e.id,e.email=a||e.email},reset:function(){e.id="",e.email=""}}})).views((function(e){return{isLoggedIn:function(){return Boolean(e.id)}}}));var S,x=y.a.model("RootStore",{currentUser:U}).create({currentUser:U.create({})}),k=Object(a.createContext)(x),C=function(){return Object(a.useContext)(k)},I=k.Provider,A=t(40),P=t(22),z=t(23),$=t.n(z),G=t(17);function L(){var e=Object(P.a)(["\n    mutation createUser($email: String!, $password: String!) {\n  createUser(input: {email: $email, password: $password}) {\n    success\n    message\n    user {\n      id\n    }\n  }\n}\n    "]);return L=function(){return e},e}function W(){var e=Object(P.a)(["\n    mutation logout {\n  logout {\n    success\n  }\n}\n    "]);return W=function(){return e},e}function q(){var e=Object(P.a)(["\n    mutation login($email: String!, $password: String!) {\n  login(input: {email: $email, password: $password}) {\n    success\n    message\n    user {\n      ...currentUser\n    }\n    token\n  }\n}\n    ",""]);return q=function(){return e},e}function B(){var e=Object(P.a)(["\n    query whoAmI {\n  whoAmI {\n    ...currentUser\n  }\n}\n    ",""]);return B=function(){return e},e}function _(){var e=Object(P.a)(["\n    query gustoUser {\n  gustoCurrentUser {\n    ...gustoUser\n  }\n}\n    ",""]);return _=function(){return e},e}function M(){var e=Object(P.a)(["\n    mutation generateGustoAuthorizationUri($provider: OAuthProvider!) {\n  generateAuthorizationUri(input: {provider: $provider}) {\n    success\n    message\n    uri\n  }\n}\n    "]);return M=function(){return e},e}function T(){var e=Object(P.a)(["\n    mutation createPost($post: CreatePostInput!) {\n  createPost(input: $post) {\n    success\n    message\n    post {\n      ...post\n    }\n  }\n}\n    ",""]);return T=function(){return e},e}function D(){var e=Object(P.a)(["\n    query userWithPosts($userId: ID!) {\n  user(id: $userId) {\n    ...userWithPosts\n  }\n}\n    ",""]);return D=function(){return e},e}function Q(){var e=Object(P.a)(["\n    query allPosts {\n  posts {\n    ...post\n  }\n}\n    ",""]);return Q=function(){return e},e}function N(){var e=Object(P.a)(["\n    fragment currentUser on User {\n  id\n  email\n}\n    "]);return N=function(){return e},e}function H(){var e=Object(P.a)(["\n    fragment gustoUser on GustoUser {\n  email\n  roles {\n    payroll_admin {\n      companies {\n        id\n        name\n        trade_name\n        locations {\n          id\n          street_1\n          street_2\n          city\n          state\n          zip\n          country\n        }\n      }\n    }\n  }\n}\n    "]);return H=function(){return e},e}function R(){var e=Object(P.a)(["\n    fragment userWithPosts on User {\n  email\n  posts {\n    title\n    body\n  }\n  gustoAccess\n}\n    "]);return R=function(){return e},e}function F(){var e=Object(P.a)(["\n    fragment post on Post {\n  id\n  title\n  body\n  author {\n    email\n  }\n}\n    "]);return F=function(){return e},e}!function(e){e.Gusto="GUSTO",e.Asana="ASANA",e.Google="GOOGLE",e.Zoom="ZOOM",e.Slack="SLACK",e.Hubspot="HUBSPOT"}(S||(S={}));var J=$()(F()),Z=$()(R()),K=$()(H()),V=$()(N()),X=$()(Q(),J);var Y=$()(D(),Z);var ee=$()(T(),J);var ne=$()(M());function te(e){return G.c(ne,e)}var ae=$()(_(),K);var re=$()(B(),V);function oe(e){return G.d(re,e)}var ie=$()(q(),V);var le=$()(W());var ue=$()(L());var ce=t(82),se=function(e){var n=e.loading,t=e.children;return n?r.a.createElement(ce.a,{thickness:"3px",speed:"1s",emptyColor:"gray.200",color:"blue.500",size:"xl"}):r.a.createElement("div",null,t)},me=function(e){var n=e.redirect,t=e.location,a=e.mustBeLoggedOut,o=Object(A.a)(e,["redirect","location","mustBeLoggedOut"]),i=oe({fetchPolicy:"no-cache"}),l=i.loading,c=i.data,s=null===c||void 0===c?void 0:c.whoAmI,m=a?s:!s;return r.a.createElement(se,{loading:l},m?r.a.createElement(u.a,{to:{pathname:n||"/login",state:{from:t}}}):r.a.createElement(u.b,o))},de=t(59),ve=t.n(de),pe=t(71),fe=t(9),ge=t(10),be=t(38),Ee=t(110),he=t(73),Oe=t(112),je=t(109),we=t(113),ye=t(108),Ue=function(e){return r.a.createElement(ye.a,Object(s.a)({isInline:!0,align:"center"},e))},Se=function(e){var n=e.name,t=e.label,a=e.labelWidth,o=Object(A.a)(e,["name","label","labelWidth"]);return r.a.createElement(Ue,{my:8},r.a.createElement(je.a,{width:a||120,htmlFor:n},t),r.a.createElement(we.a,Object.assign({name:n,display:"inline-block"},o)))},xe=t(55),ke=function(e){var n=e.children,t=e.onSubmit;return r.a.createElement("form",{onSubmit:t},r.a.createElement(xe.a,null,n))},Ce=function(e){var n=e.handleSubmit,t=e.errorMessage,o=Object(a.useState)({email:"",password:""}),i=Object(fe.a)(o,2),l=i[0],u=i[1],c=function(e){var n=e.currentTarget,t=n.name,a=n.value;u(Object(s.a)(Object(s.a)({},l),{},Object(be.a)({},t,a)))};return r.a.createElement(ke,{onSubmit:function(e){e.preventDefault(),n(l)}},r.a.createElement(Ee.a,{fontSize:"3xl"},"Welcome back!"),r.a.createElement(Se,{name:"email",type:"email",autoComplete:"email",label:"Email:",value:l.email,placeholder:"example@bitmatica.com",onChange:c,display:"inline-block"}),r.a.createElement(Se,{name:"password",type:"password",autoComplete:"password",label:"Password:",value:l.password,isRequired:!0,onChange:c}),r.a.createElement(he.a,{direction:"row",justifyContent:"flex-end"},r.a.createElement(Oe.a,Object.assign({},O.buttons.variants.primary,{type:"submit"}),"Login")),r.a.createElement(Ee.a,{color:"red"},t))},Ie=function(){var e,n,t=G.c(ie,n),r=C(),o=Object(fe.a)(t,2)[1],i=o.called,l=o.loading,u=o.data,c=null===u||void 0===u||null===(e=u.login)||void 0===e?void 0:e.token;return Object(a.useEffect)((function(){if(i&&!l){if(!c)throw new Error("Wrong username/password.");E(c),r.currentUser.updateUser(null===u||void 0===u?void 0:u.login.user)}})),t};function Ae(){var e,n=C(),t=G.c(le,e),r=Object(fe.a)(t,2)[1],o=r.called,i=r.loading,l=r.data,u=Object(G.a)();return Object(a.useEffect)((function(){o&&!i&&(null===l||void 0===l?void 0:l.logout.success)&&(n.currentUser.reset(),E(""),u.writeQuery({query:re,data:{whoAmI:null}}))})),t}var Pe=function(e){var n=Ae(),t=Object(fe.a)(n,2),a=t[0],o=t[1],i=o.called,l=o.loading,c=o.data;return i&&!l&&(null===c||void 0===c?void 0:c.logout.success)?r.a.createElement(u.a,{to:"login"}):r.a.createElement(Oe.a,Object.assign({},O.buttons.variants.primary,{variant:"outline",onClick:function(){a()}},e),e.children)},ze=t(76),$e=function(){var e=oe({pollInterval:400}),n=e.loading,t=e.data;return r.a.createElement(se,{loading:n},r.a.createElement(he.a,{direction:"row",align:"center",height:16,color:"white",backgroundColor:"primary"},r.a.createElement(ze.a,{ml:8,name:"view",size:"24px"}),r.a.createElement(Ee.a,{ml:8,fontSize:"4xl"},"Bitmatiblog"),(null===t||void 0===t?void 0:t.whoAmI)&&r.a.createElement(Pe,{ml:"auto",mr:4},"Logout")))},Ge=function(e){var n=e.children;return r.a.createElement(he.a,{border:"1px solid black",alignContent:"center",minHeight:"100vh",direction:"column"},r.a.createElement($e,null),r.a.createElement(ge.a,{maxWidth:["100%","100%",O.sizes["3xl"]],width:[null,null,"80%"],mx:[4,4,"0 auto"],pt:[4],bg:"blackAlpha.50",flexGrow:2},n))},Le=function(){var e=Ie(),n=Object(fe.a)(e,2),t=n[0],o=n[1].data,i=Object(a.useState)(""),l=Object(fe.a)(i,2),c=l[0],s=l[1],m=!(null===o||void 0===o?void 0:o.login.success)&&(null===o||void 0===o?void 0:o.login.message);m&&m!==c&&s(m);var d=function(){var e=Object(pe.a)(ve.a.mark((function e(n){return ve.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:t({variables:n});case 1:case"end":return e.stop()}}),e)})));return function(n){return e.apply(this,arguments)}}();return(null===o||void 0===o?void 0:o.login.success)?r.a.createElement(u.a,{to:"/"}):r.a.createElement(Ge,null,r.a.createElement(ge.a,{pt:8},r.a.createElement(Ce,{handleSubmit:d,errorMessage:c})))},We=function(e){var n=e.post;return r.a.createElement("div",null,r.a.createElement("div",null,n.id),r.a.createElement("div",null,n.title),r.a.createElement("div",null,n.body))},qe=function(e){var n=e.posts;return(null===n||void 0===n?void 0:n.length)?r.a.createElement("div",null,n.map((function(e){return r.a.createElement(We,{key:e.id,post:e})}))):r.a.createElement("div",null,"No posts!")};var Be=function(e){return r.a.createElement(u.b,{path:"/",render:function(){return window.location.href=e.uri,null}})},_e=function(e){var n=function(){var e=te(),n=Object(fe.a)(e,2)[1],t=n.called,r=n.loading,o=n.data;return Object(a.useEffect)((function(){console.log("using effect"),t&&!r&&(null===o||void 0===o?void 0:o.generateAuthorizationUri.success)&&(console.log("setting uri to "+(null===o||void 0===o?void 0:o.generateAuthorizationUri.uri)),window.location.href="".concat(null===o||void 0===o?void 0:o.generateAuthorizationUri.uri))})),te()}(),t=Object(fe.a)(n,2),o=t[0],i=t[1],l=i.called,u=i.loading,c=i.data;return l&&!u&&(null===c||void 0===c?void 0:c.generateAuthorizationUri.success)?r.a.createElement(Be,{uri:"".concat(null===c||void 0===c?void 0:c.generateAuthorizationUri.uri)}):r.a.createElement(Oe.a,Object.assign({},O.buttons.variants.primary,{variant:"outline",onClick:function(){o({variables:{provider:S.Gusto}})}},e),e.children)},Me=function(){var e,n,t,a=G.d(ae,t),o=a.loading,i=a.data;return r.a.createElement(se,{loading:o},r.a.createElement("div",null,"Gusto User Profile:"),r.a.createElement("div",null,"Email: ",null===i||void 0===i||null===(e=i.gustoCurrentUser)||void 0===e?void 0:e.email),null===i||void 0===i||null===(n=i.gustoCurrentUser)||void 0===n?void 0:n.roles.payroll_admin.companies.map((function(e){return r.a.createElement("div",{key:e.id},r.a.createElement("div",null,e.name),r.a.createElement("div",null,e.trade_name),e.locations.map((function(e){return r.a.createElement("div",{key:e.id},r.a.createElement("div",null,e.street_1),r.a.createElement("div",null,e.street_2),r.a.createElement("div",null,e.city),r.a.createElement("div",null,e.state))})))})))},Te=function(e){var n,t,a,o,i=e.userId,l=(o={variables:{userId:i}},G.d(Y,o)),u=l.loading,c=l.data;return r.a.createElement(se,{loading:u},r.a.createElement("div",null,"User profile"),r.a.createElement("div",null,"Id: ",i),r.a.createElement("div",null,"Email: ",null===c||void 0===c||null===(n=c.user)||void 0===n?void 0:n.email),r.a.createElement("div",null,"Posts: ",r.a.createElement(qe,{posts:(null===c||void 0===c||null===(t=c.user)||void 0===t?void 0:t.posts)||[]})),r.a.createElement("div",null,(null===c||void 0===c||null===(a=c.user)||void 0===a?void 0:a.gustoAccess)?r.a.createElement(Me,null):r.a.createElement(_e,null,"Connect Gusto!")))},De=t(77);function Qe(){return e={update:function(e,n){var t,a,r=null===n||void 0===n||null===(t=n.data)||void 0===t||null===(a=t.createPost)||void 0===a?void 0:a.post,o=e.readQuery({query:X});e.writeQuery({query:X,data:Object(De.a)(o,(function(e){e.posts.push(r)}))})}},G.c(ee,e);var e}var Ne=function(e){var n=e.authorId,t=Qe(),o=Object(fe.a)(t,1)[0],i=Object(a.useState)(""),l=Object(fe.a)(i,2),u=l[0],c=l[1],s=Object(a.useState)(""),m=Object(fe.a)(s,2),d=m[0],v=m[1],p={title:u,authorId:n,body:d};return r.a.createElement("form",{onSubmit:function(e){e.preventDefault(),o({variables:{post:p}})}},"Create Post:",r.a.createElement("input",{value:u,onChange:function(e){return c(e.target.value)}}),r.a.createElement("input",{value:d,onChange:function(e){return v(e.target.value)}}),r.a.createElement("input",{value:"Submit",type:"submit"}))},He=function(){var e,n=oe(),t=n.loading,a=n.data,o=(null===a||void 0===a||null===(e=a.whoAmI)||void 0===e?void 0:e.id)||"";return r.a.createElement(Ge,null,r.a.createElement(se,{loading:t},r.a.createElement(Ne,{authorId:o}),r.a.createElement(Te,{userId:o})))},Re=function(e){var n=e.match;return r.a.createElement(Ge,null,r.a.createElement(Te,{userId:n.params.userId}))},Fe=function(e){var n=e.redirect,t=Object(A.a)(e,["redirect"]);return r.a.createElement(me,Object.assign({redirect:n||"/",mustBeLoggedOut:!0},t))},Je=t(78),Ze=t.n(Je),Ke=t(79),Ve=t.n(Ke),Xe=["email","password"],Ye=function(e){var n=e.values,t=e.handleChange;return r.a.createElement("div",null,Object.keys(n).map((function(e){var a=Xe.includes(e)?e:"text";return r.a.createElement("label",{key:e},Ze()(e),r.a.createElement("input",{type:a,name:e,onChange:t,value:Ve()(n,[e])}))})))},en=function(e){var n=e.inputs,t=e.errorMessage,a=e.handleSubmit,o=e.handleUpdate;return r.a.createElement("form",{onSubmit:function(e){e&&e.preventDefault(),a()}},"Register User Form",r.a.createElement(Ye,{values:n,handleChange:o}),r.a.createElement("input",{type:"submit",value:"Submit"}),r.a.createElement("div",null,t))},nn={email:"",password:""},tn=function(){var e,n=Object(a.useState)(nn),t=Object(fe.a)(n,2),o=t[0],i=t[1],l=G.c(ue,e),c=Object(fe.a)(l,2),m=c[0],d=c[1].data,v=Ie(),p=Object(fe.a)(v,2),f=p[0],g=p[1],b=g.called,E=g.loading,h=g.data;(null===d||void 0===d?void 0:d.createUser.success)&&!b&&f({variables:o});return!E&&(null===h||void 0===h?void 0:h.login.success)?r.a.createElement(u.a,{to:"/"}):r.a.createElement(Ge,null,r.a.createElement(en,{inputs:o,errorMessage:null===d||void 0===d?void 0:d.createUser.message,handleSubmit:function(){m({variables:o})},handleUpdate:function(e){var n=e.currentTarget,t=n.name,a=n.value;i((function(e){return Object(s.a)(Object(s.a)({},e),{},Object(be.a)({},t,a))}))}}))},an=function(){var e=Object(f.a)((function(e,n){var t=n.headers,a=sessionStorage.getItem(b);return{headers:Object(s.a)(Object(s.a)({},t),a&&"null"!==a&&{authorization:"Bearer ".concat(a)})}})),n=Object(g.a)((function(e){var n=e.graphQLErrors,t=e.networkError;n&&n.map((function(e){var n=e.message,t=e.locations,a=e.path;return console.log("[GraphQL error]: Message: ".concat(n,", Location: ").concat(t,", Path: ").concat(a))})),t&&console.log("[Network error]: ".concat(t))})),t=Object(d.a)({uri:"https://gusto.apps.bitmatica.com/graphql"}),a=new v.a;return new m.a({cache:a,link:p.a.from([e,n,t]),connectToDevTools:!0})}();window.apolloClient=an;var rn=function(){var e=C();return r.a.createElement(I,{value:e},r.a.createElement(j.a,{theme:O},r.a.createElement(w.a,null),r.a.createElement(l.a,null,r.a.createElement(c.a,{client:an},r.a.createElement(u.d,null,r.a.createElement(Fe,{path:"/login",component:Le}),r.a.createElement(Fe,{path:"/register",component:tn}),r.a.createElement(me,{path:"/user/:userId",component:Re}),r.a.createElement(me,{path:"*",component:He}))))))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));i.a.render(r.a.createElement(rn,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()}))},83:function(e,n,t){e.exports=t(104)}},[[83,1,2]]]);
//# sourceMappingURL=main.cfaa80e3.chunk.js.map