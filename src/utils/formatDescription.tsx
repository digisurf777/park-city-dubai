import { Check } from "lucide-react";

export const formatDescription = (description: string | undefined) => {
  if (!description) return null;

  // Split by line breaks and filter empty lines
  const lines = description
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // Check if description already has bullet points (✅ or •)
  const hasBullets = lines.some(line => line.startsWith('✅') || line.startsWith('•') || line.startsWith('-'));

  // If no line breaks and no bullets, try to split by sentences
  if (lines.length === 1 && !hasBullets) {
    // Split by periods, commas, or natural breaks
    const sentences = description
      .split(/[.;]/)
      .map(s => s.trim())
      .filter(s => s.length > 10); // Only keep substantial sentences

    if (sentences.length > 1) {
      return (
        <ul className="space-y-2">
          {sentences.map((sentence, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="leading-relaxed">{sentence}</span>
            </li>
          ))}
        </ul>
      );
    }
  }

  // Format with bullet points
  return (
    <ul className="space-y-2">
      {lines.map((line, index) => {
        // Remove existing bullet markers
        const cleanLine = line.replace(/^[✅•\-]\s*/, '');
        
        return (
          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <span className="leading-relaxed">{cleanLine}</span>
          </li>
        );
      })}
    </ul>
  );
};
