import { Pipe, PipeTransform } from '@angular/core';

// Turns minutes into a friendly text: 139 -> "2h 19m"
@Pipe({ name: 'runtime' })
export class RuntimePipe implements PipeTransform {
  transform(minutes: number | null | undefined): string {
    // TMDB sometimes has no runtime (null or 0)
    if (!minutes || minutes <= 0) return 'N/A';

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) return `${remainingMinutes}m`;
    return remainingMinutes === 0 ? `${hours}h` : `${hours}h ${remainingMinutes}m`;
  }
}
    