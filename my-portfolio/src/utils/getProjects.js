export async function getProjects() {
  const response = await fetch("/data/projects.json");

  if (!response.ok) {
    throw new Error("Failed to fetch projects data");
  }

  return response.json();
}