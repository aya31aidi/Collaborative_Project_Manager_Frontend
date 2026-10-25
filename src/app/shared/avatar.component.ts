import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Round initials badge. The colour comes from the name, so a person keeps theirs everywhere. */
@Component({
  selector: 'app-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span [style.background]="color()" [title]="name()">{{ initials() }}</span>`,
  styles: [
    `
      :host {
        display: inline-flex;
        flex: none;
      }
      span {
        display: grid;
        place-items: center;
        width: var(--size);
        height: var(--size);
        border-radius: 50%;
        color: #fff;
        font-size: calc(var(--size) * 0.4);
        font-weight: 650;
        letter-spacing: 0.02em;
        user-select: none;
      }
    `,
  ],
  host: { '[style.--size.px]': 'size()' },
})
export class AvatarComponent {
  name = input.required<string>();
  size = input(28);

  initials = computed(() => {
    const parts = this.name().trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    const first = parts[0][0];
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  });

  color = computed(() => {
    let hash = 0;
    for (const ch of this.name()) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue} 52% 46%)`;
  });
}
