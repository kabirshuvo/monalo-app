import Link from 'next/link'
import { GUEST_TRY_ROOMS } from '@/lib/learning/guest-try'

const STEPS = [
  {
    title: 'Listen and tap',
    body: 'Your child hears a letter sound, then taps the balloon that matches. Short rounds that fit into any spare moment.',
  },
  {
    title: 'Build real words',
    body: 'From letter sounds to blending, segmenting, digraphs and sight words, one small step at a time.',
  },
  {
    title: 'Unlock the next set',
    body: 'Letters come in four groups, starting with s a t p i n. Finish a group to earn a sticker and open the next.',
  },
]

const FOR_GROWN_UPS = [
  {
    title: 'See how they are doing',
    body: 'A progress view shows which letters and words your child has mastered and what is coming next.',
  },
  {
    title: 'Keeps going on a weak connection',
    body: 'Sounds and pictures are saved on the device as your child plays, so a patchy signal does not stop the game.',
  },
  {
    title: 'A school behind it',
    body: 'Eco Penguin is made by Monalo School. What the school earns goes back into helping students learn.',
  },
]

/** Parent-first landing sections: how it works, try it now, reassurance. */
export default function ParentSections() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-24 px-4 pb-24 sm:space-y-32 sm:px-6 lg:px-8">
      <section aria-labelledby="how-heading">
        <h2 id="how-heading" className="max-w-2xl text-4xl font-normal leading-tight text-content sm:text-5xl">
          How Eco Penguin teaches reading
        </h2>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-content-secondary">
          Phonics first: the sounds letters make, then the words they build. No pressure, no
          timers to beat.
        </p>
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="rounded-3xl border border-[var(--orbit-line)] p-7"
            >
              <span className="font-serif text-3xl leading-none text-[var(--sun)]">{i + 1}</span>
              <h3 className="mt-4 text-xl font-bold text-content">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-content-secondary">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="try-heading">
        <h2 id="try-heading" className="text-4xl font-normal leading-tight text-content sm:text-5xl">
          Try it now. No account needed.
        </h2>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-content-secondary">
          Sit down with your child and play a room together. Sign up later if you want stars and
          stickers saved.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {GUEST_TRY_ROOMS.map((room) => (
            <Link
              key={room.id}
              href={room.href}
              className="group rounded-3xl border border-[var(--orbit-line)] p-7 transition-colors hover:bg-[var(--surface-hover)]"
            >
              <span className="block font-serif text-2xl text-content">{room.title}</span>
              <span className="mt-2 block leading-relaxed text-content-secondary group-hover:text-content">
                {room.detail}
              </span>
              <span className="mt-5 inline-block font-bold text-[var(--sun)]">Play free →</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="grownups-heading">
        <h2 id="grownups-heading" className="text-4xl font-normal leading-tight text-content sm:text-5xl">
          Made with grown-ups in mind
        </h2>
        <ul className="mt-10 grid gap-8 md:grid-cols-3">
          {FOR_GROWN_UPS.map((item) => (
            <li key={item.title}>
              <h3 className="text-lg font-bold text-content">{item.title}</h3>
              <p className="mt-2 leading-relaxed text-content-secondary">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
