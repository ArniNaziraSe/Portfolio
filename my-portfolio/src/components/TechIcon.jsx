import {
  // Frontend
  SiReact, SiVuedotjs, SiNextdotjs, SiNuxtdotjs, SiAngular, SiSvelte,
  SiTailwindcss, SiBootstrap, SiSass, SiTypescript, SiJavascript,
  SiHtml5, SiCss3, SiRedux, SiAlpinedotjs, SiAstro,
  // Backend
  SiNodedotjs, SiExpress, SiLaravel, SiPhp, SiPython, SiDjango, SiFlask,
  SiNestjs, SiGraphql,
  // Database
  SiMysql, SiPostgresql, SiMongodb, SiRedis, SiSqlite, SiFirebase, SiSupabase,
  SiPrisma,
  // Mobile
  SiFlutter, SiKotlin, SiSwift, SiAndroid,
  // DevOps
  SiGit, SiGithub, SiGitlab, SiDocker, SiVercel, SiNetlify,
  // Design
  SiFigma, SiCanva,
  // PM
  SiTrello, SiJira, SiSlack, SiNotion,
  // Other
  SiWordpress,
} from "react-icons/si";
import "./TechIcon.css";

// Custom brand box: kotak warna dengan huruf. Untuk logo yang tidak
// tersedia di react-icons/si (Microsoft, Google, Livewire, Blade, dll).
function BrandBox({ letter, color, size }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 3,
        background: color,
        color: "white",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.max(size * 0.65, 8),
        fontWeight: 800,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        lineHeight: 1,
        flexShrink: 0,
      }}
    >
      {letter}
    </span>
  );
}

// URUTAN: paling spesifik dulu. "next.js" sebelum "next", dst.
// Substring matching: "Laravel 10+" match keyword "laravel" -> Laravel logo.
const iconMap = [
  // ============ Framework specific dulu ============
  { keywords: ["next.js", "nextjs", "next js"], Icon: SiNextdotjs, color: "#000000" },
  { keywords: ["nuxt.js", "nuxtjs", "nuxt"], Icon: SiNuxtdotjs, color: "#00DC82" },
  { keywords: ["react native", "reactnative"], Icon: SiReact, color: "#61DAFB" },
  { keywords: ["react.js", "reactjs", "react"], Icon: SiReact, color: "#61DAFB" },
  { keywords: ["vue.js", "vuejs", "vue"], Icon: SiVuedotjs, color: "#4FC08D" },
  { keywords: ["node.js", "nodejs", "node js"], Icon: SiNodedotjs, color: "#339933" },
  { keywords: ["angular"], Icon: SiAngular, color: "#DD0031" },
  { keywords: ["svelte"], Icon: SiSvelte, color: "#FF3E00" },
  { keywords: ["astro"], Icon: SiAstro, color: "#FF5D01" },
  { keywords: ["alpine.js", "alpinejs", "alpine js", "alpine"], Icon: SiAlpinedotjs, color: "#8BC0D0" },
  { keywords: ["express"], Icon: SiExpress, color: "#000000" },
  { keywords: ["nestjs", "nest.js", "nest js"], Icon: SiNestjs, color: "#E0234E" },
  { keywords: ["redux"], Icon: SiRedux, color: "#764ABC" },
  { keywords: ["bootstrap"], Icon: SiBootstrap, color: "#7952B3" },
  { keywords: ["sass", "scss"], Icon: SiSass, color: "#CC6699" },
  { keywords: ["tailwind"], Icon: SiTailwindcss, color: "#06B6D4" },
  { keywords: ["typescript"], Icon: SiTypescript, color: "#3178C6" },
  { keywords: ["javascript", "java script"], Icon: SiJavascript, color: "#F7DF1E" },
  { keywords: ["html"], Icon: SiHtml5, color: "#E34F26" },
  { keywords: ["css"], Icon: SiCss3, color: "#1572B6" },

  // ============ Backend ============
  // Livewire dulu (spesifik), sebelum Laravel keyword catch
  { keywords: ["livewire"], brand: { letter: "L", color: "#FB70A9" } },
  { keywords: ["blade"], brand: { letter: "B", color: "#F53003" } },
  { keywords: ["filament"], brand: { letter: "F", color: "#F59E0B" } },
  { keywords: ["inertia"], brand: { letter: "I", color: "#9553E9" } },
  { keywords: ["laravel"], Icon: SiLaravel, color: "#FF2D20" },
  { keywords: ["php"], Icon: SiPhp, color: "#777BB4" },
  { keywords: ["django"], Icon: SiDjango, color: "#092E20" },
  { keywords: ["flask"], Icon: SiFlask, color: "#000000" },
  { keywords: ["python"], Icon: SiPython, color: "#3776AB" },
  { keywords: ["graphql"], Icon: SiGraphql, color: "#E10098" },

  // ============ Database / ORM ============
  { keywords: ["prisma"], Icon: SiPrisma, color: "#2D3748" },
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

  // ============ DevOps ============
  { keywords: ["docker"], Icon: SiDocker, color: "#2496ED" },
  { keywords: ["vercel"], Icon: SiVercel, color: "#000000" },
  { keywords: ["netlify"], Icon: SiNetlify, color: "#00C7B7" },

  // ============ Design ============
  { keywords: ["figma"], Icon: SiFigma, color: "#F24E1E" },
  { keywords: ["canva"], Icon: SiCanva, color: "#00C4CC" },

  // ============ PM ============
  { keywords: ["trello"], Icon: SiTrello, color: "#0079BF" },
  { keywords: ["jira", "agile", "scrum"], Icon: SiJira, color: "#0052CC" },
  { keywords: ["slack"], Icon: SiSlack, color: "#4A154B" },
  { keywords: ["notion"], Icon: SiNotion, color: "#000000" },

  // ============ Microsoft Office (BrandBox) ============
  { keywords: ["microsoft excel", "ms excel", "excel"], brand: { letter: "X", color: "#217346" } },
  { keywords: ["microsoft powerpoint", "ms powerpoint", "powerpoint", "ppt"], brand: { letter: "P", color: "#B7472A" } },
  { keywords: ["outlook", "microsoft outlook"], brand: { letter: "O", color: "#0078D4" } },
  { keywords: ["microsoft word", "ms word", "word"], brand: { letter: "W", color: "#2B579A" } },

  // ============ Google Workspace (BrandBox) ============
  { keywords: ["google sheets", "google sheet", "gsheets"], brand: { letter: "S", color: "#0F9D58" } },
  { keywords: ["google docs", "google doc", "gdocs"], brand: { letter: "D", color: "#4285F4" } },
  { keywords: ["google slides", "gslides"], brand: { letter: "S", color: "#F4B400" } },
  { keywords: ["sheets"], brand: { letter: "S", color: "#0F9D58" } },

  // Other
  { keywords: ["wordpress"], Icon: SiWordpress, color: "#21759B" },
];

function TechIcon({ name, size = 14 }) {
  if (!name) return null;
  const lower = String(name).toLowerCase();

  for (const entry of iconMap) {
    const matched = entry.keywords.some((kw) => lower.includes(kw));
    if (matched) {
      if (entry.Icon) return <entry.Icon size={size} color={entry.color} style={{ flexShrink: 0 }} />;
      if (entry.brand) return <BrandBox letter={entry.brand.letter} color={entry.brand.color} size={size} />;
    }
  }

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