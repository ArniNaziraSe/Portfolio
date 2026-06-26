import {
  // Frontend
  SiReact, SiVuedotjs, SiAngular, SiNextdotjs, SiSvelte, SiVite,
  SiJavascript, SiTypescript, SiHtml5, SiCss3, SiSass, SiTailwindcss, SiBootstrap,
  // Backend
  SiNodedotjs, SiExpress, SiNestjs, SiDjango, SiFlask, SiLaravel, SiPhp, SiPython,
  // Database
  SiPostgresql, SiMysql, SiMongodb, SiSqlite, SiRedis, SiFirebase, SiSupabase,
  // Cloud & DevOps
  SiDocker, SiKubernetes, SiCloudflare, SiVercel, SiNetlify, SiHeroku,
  // Version control
  SiGit, SiGithub, SiGitlab,
  // Design
  SiFigma, SiCanva,
  // Mobile
  SiKotlin, SiSwift, SiFlutter, SiDart, SiAndroid,
  // Other languages
  SiGo, SiRust, SiCplusplus, SiC,
  // Tools
  SiPostman, SiNotion, SiSlack,
} from "react-icons/si";

// Mapping nama → icon. Pakai lowercase + strip spasi biar match-nya forgiving.
// "React.js", "React", "react" semua match ke SiReact.
const ICON_MAP = {
  // Frontend frameworks
  react: SiReact, reactjs: SiReact,
  vue: SiVuedotjs, vuejs: SiVuedotjs,
  angular: SiAngular,
  nextjs: SiNextdotjs, next: SiNextdotjs,
  svelte: SiSvelte,
  vite: SiVite,

  // Languages
  javascript: SiJavascript, js: SiJavascript,
  typescript: SiTypescript, ts: SiTypescript,
  html: SiHtml5, html5: SiHtml5,
  css: SiCss3, css3: SiCss3,
  sass: SiSass, scss: SiSass,
  tailwind: SiTailwindcss, tailwindcss: SiTailwindcss,
  bootstrap: SiBootstrap,

  // Backend
  node: SiNodedotjs, nodejs: SiNodedotjs,
  express: SiExpress, expressjs: SiExpress,
  nest: SiNestjs, nestjs: SiNestjs,
  django: SiDjango,
  flask: SiFlask,
  laravel: SiLaravel,
  php: SiPhp,
  python: SiPython,

  // Database
  postgresql: SiPostgresql, postgres: SiPostgresql,
  mysql: SiMysql,
  mongodb: SiMongodb, mongo: SiMongodb,
  sqlite: SiSqlite,
  redis: SiRedis,
  firebase: SiFirebase,
  supabase: SiSupabase,

  // Cloud & DevOps
  docker: SiDocker,
  kubernetes: SiKubernetes, k8s: SiKubernetes,
  cloudflare: SiCloudflare,
  vercel: SiVercel,
  netlify: SiNetlify,
  heroku: SiHeroku,

  // Version control
  git: SiGit,
  github: SiGithub,
  gitlab: SiGitlab,

  // Design
  figma: SiFigma,
  canva: SiCanva,

  // Mobile
  kotlin: SiKotlin,
  swift: SiSwift,
  flutter: SiFlutter,
  dart: SiDart,
  android: SiAndroid,

  // Other languages
  go: SiGo, golang: SiGo,
  rust: SiRust,
  "c++": SiCplusplus, cpp: SiCplusplus, cplusplus: SiCplusplus,
  c: SiC,

  // Tools
  postman: SiPostman,
  notion: SiNotion,
  slack: SiSlack,
};

// Warna brand official tiap tech. Kalau gak ada di map, fallback ke abu-abu.
const COLOR_MAP = {
  react: "#61DAFB", vue: "#4FC08D", angular: "#DD0031", nextjs: "#000000", svelte: "#FF3E00", vite: "#646CFF",
  javascript: "#F7DF1E", typescript: "#3178C6", html: "#E34F26", css: "#1572B6", sass: "#CC6699",
  tailwind: "#06B6D4", bootstrap: "#7952B3",
  node: "#5FA04E", express: "#000000", nest: "#E0234E", django: "#092E20", flask: "#000000", laravel: "#FF2D20",
  php: "#777BB4", python: "#3776AB",
  postgresql: "#4169E1", mysql: "#4479A1", mongodb: "#47A248", redis: "#FF4438", firebase: "#DD2C00", supabase: "#3FCF8E",
  docker: "#2496ED", kubernetes: "#326CE5", cloudflare: "#F38020",
  vercel: "#000000", netlify: "#00C7B7", heroku: "#430098",
  git: "#F05032", github: "#181717", gitlab: "#FC6D26",
  figma: "#F24E1E", canva: "#00C4CC",
  kotlin: "#7F52FF", swift: "#F05138", flutter: "#02569B", dart: "#0175C2", android: "#34A853",
  go: "#00ADD8", rust: "#000000", "c++": "#00599C",
  postman: "#FF6C37", notion: "#000000", slack: "#4A154B",
};

function normalize(name) {
  return name.toLowerCase().replace(/[\s.]+/g, "");
}

function TechIcon({ name, size = 18, showLabel = false, className = "" }) {
  const key = normalize(name);
  const Icon = ICON_MAP[key];
  const color = COLOR_MAP[key] || "#807479";

  if (!Icon) {
    return (
      <span className={`tech-icon-fallback ${className}`}>
        {showLabel ? name : name.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <span className={`tech-icon ${className}`} title={name}>
      <Icon size={size} color={color} />
      {showLabel && <span className="tech-icon-label">{name}</span>}
    </span>
  );
}

export default TechIcon;