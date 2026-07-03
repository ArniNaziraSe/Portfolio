import {
  // Frontend
  SiReact, SiVuedotjs, SiNextdotjs, SiAngular, SiSvelte,
  SiTailwindcss, SiBootstrap, SiSass, SiTypescript, SiJavascript,
  SiHtml5, SiCss3, SiRedux,
  // Backend
  SiNodedotjs, SiExpress, SiLaravel, SiPhp, SiPython, SiDjango, SiFlask,
  // Database
  SiMysql, SiPostgresql, SiMongodb, SiRedis, SiSqlite, SiFirebase, SiSupabase,
  // Mobile
  SiFlutter, SiKotlin, SiSwift, SiAndroid,
  // DevOps / Deploy
  SiGit, SiGithub, SiGitlab, SiDocker, SiVercel, SiNetlify,
  // Design
  SiFigma, SiCanva,
  // Productivity / PM
  SiTrello, SiJira, SiSlack, SiNotion,
  // Microsoft Office
  SiMicrosoftexcel, SiMicrosoftword, SiMicrosoftpowerpoint, SiMicrosoftoutlook,
  // Google
  SiGooglesheets, SiGoogledocs, SiGoogleslides,
  // Other
  SiWordpress,
} from "react-icons/si";
import "./TechIcon.css";

// URUTAN: yang paling spesifik/panjang di atas.
// "next.js" harus dicek sebelum "next". "google sheets" sebelum "google".
const iconMap = [
  // ============ Framework variants (specific dulu) ============
  { keywords: ["next.js", "nextjs", "next js"], Icon: SiNextdotjs, color: "#000000" },
  { keywords: ["react native", "reactnative"], Icon: SiReact, color: "#61DAFB" },
  { keywords: ["react.js", "reactjs", "react"], Icon: SiReact, color: "#61DAFB" },
  { keywords: ["vue.js", "vuejs", "vue"], Icon: SiVuedotjs, color: "#4FC08D" },
  { keywords: ["node.js", "nodejs", "node js"], Icon: SiNodedotjs, color: "#339933" },
  { keywords: ["angular"], Icon: SiAngular, color: "#DD0031" },
  { keywords: ["svelte"], Icon: SiSvelte, color: "#FF3E00" },
  { keywords: ["express"], Icon: SiExpress, color: "#000000" },
  { keywords: ["redux"], Icon: SiRedux, color: "#764ABC" },
  { keywords: ["bootstrap"], Icon: SiBootstrap, color: "#7952B3" },
  { keywords: ["sass", "scss"], Icon: SiSass, color: "#CC6699" },
  { keywords: ["tailwind"], Icon: SiTailwindcss, color: "#06B6D4" },
  { keywords: ["typescript"], Icon: SiTypescript, color: "#3178C6" },
  { keywords: ["javascript", "java script"], Icon: SiJavascript, color: "#F7DF1E" },
  { keywords: ["html"], Icon: SiHtml5, color: "#E34F26" },
  { keywords: ["css"], Icon: SiCss3, color: "#1572B6" },

  // ============ Backend ============
  { keywords: ["laravel"], Icon: SiLaravel, color: "#FF2D20" },
  { keywords: ["php"], Icon: SiPhp, color: "#777BB4" },
  { keywords: ["django"], Icon: SiDjango, color: "#092E20" },
  { keywords: ["flask"], Icon: SiFlask, color: "#000000" },
  { keywords: ["python"], Icon: SiPython, color: "#3776AB" },

  // ============ Database ============
  { keywords: ["mysql"], Icon: SiMysql, color: "#4479A1" },
  { keywords: ["postgresql", "postgres", "psql"], Icon: SiPostgresql, color: "#4169E1" },
  { keywords: ["mongodb", "mongo"], Icon: SiMongodb, color: "#47A248" },
  { keywords: ["redis"], Icon: SiRedis, color: "#DC382D" },
  { keywords: ["sqlite"], Icon: SiSqlite, color: "#003B57" },
  { keywords: ["firebase"], Icon: SiFirebase, color: "#FFCA28" },
  { keywords: ["supabase"], Icon: SiSupabase, color: "#3ECF8E" },

  // ============ Mobile ============
  { keywords: ["flutter"], Icon: SiFlutter, color: "#02569B" },
  { keywords: ["kotlin"], Icon: SiKotlin, color: "#7F52FF" },
  { keywords: ["swift"], Icon: SiSwift, color: "#F05138" },
  { keywords: ["android"], Icon: SiAndroid, color: "#3DDC84" },

  // ============ Version Control ============
  { keywords: ["github"], Icon: SiGithub, color: "#181717" },
  { keywords: ["gitlab"], Icon: SiGitlab, color: "#FC6D26" },
  { keywords: ["git", "version control", "vcs"], Icon: SiGit, color: "#F05032" },

  // ============ DevOps / Deploy ============
  { keywords: ["docker"], Icon: SiDocker, color: "#2496ED" },
  { keywords: ["vercel"], Icon: SiVercel, color: "#000000" },
  { keywords: ["netlify"], Icon: SiNetlify, color: "#00C7B7" },

  // ============ Design ============
  { keywords: ["figma"], Icon: SiFigma, color: "#F24E1E" },
  { keywords: ["canva"], Icon: SiCanva, color: "#00C4CC" },

  // ============ Productivity / PM (Agile via Jira) ============
  { keywords: ["trello"], Icon: SiTrello, color: "#0079BF" },
  { keywords: ["jira", "agile", "scrum"], Icon: SiJira, color: "#0052CC" },
  { keywords: ["slack"], Icon: SiSlack, color: "#4A154B" },
  { keywords: ["notion"], Icon: SiNotion, color: "#000000" },

  // ============ Microsoft Office ============
  { keywords: ["microsoft excel", "ms excel", "excel"], Icon: SiMicrosoftexcel, color: "#217346" },
  { keywords: ["microsoft word", "ms word"], Icon: SiMicrosoftword, color: "#2B579A" },
  { keywords: ["microsoft powerpoint", "ms powerpoint", "powerpoint", "ppt"], Icon: SiMicrosoftpowerpoint, color: "#B7472A" },
  { keywords: ["outlook", "microsoft outlook"], Icon: SiMicrosoftoutlook, color: "#0078D4" },
  // "word" pisah, taruh terakhir supaya "microsoft word" match dulu
  { keywords: ["word"], Icon: SiMicrosoftword, color: "#2B579A" },

  // ============ Google ============
  { keywords: ["google sheets", "google sheet", "gsheets"], Icon: SiGooglesheets, color: "#0F9D58" },
  { keywords: ["google docs", "google doc", "gdocs"], Icon: SiGoogledocs, color: "#4285F4" },
  { keywords: ["google slides", "gslides"], Icon: SiGoogleslides, color: "#F4B400" },
  { keywords: ["sheets"], Icon: SiGooglesheets, color: "#0F9D58" }, // fallback pendek

  // ============ Other ============
  { keywords: ["wordpress"], Icon: SiWordpress, color: "#21759B" },
];

function TechIcon({ name, size = 14 }) {
  if (!name) return null;
  const lower = String(name).toLowerCase();

  for (const { keywords, Icon, color } of iconMap) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        return <Icon size={size} color={color} style={{ flexShrink: 0 }} />;
      }
    }
  }

  // Fallback: huruf pertama dengan style bulet teal
  return (
    <span
      className="tech-icon-fallback"
      style={{ width: size, height: size, fontSize: Math.max(size * 0.55, 8) }}
    >
      {String(name).charAt(0).toUpperCase()}
    </span>
  );
}

export default TechIcon;