import socialInnovationLogo from './assets/social-innovation-logo.webp'

const timeline = [
  {
    stage: 'She was 13',
    title: 'I saw it before anyone else did',
    body: `It started small — the kind of small most people wouldn't pick up on. The way she went quiet, but not peaceful quiet. Heavy quiet. She'd sit there, staring, like she was somewhere else even though she was right in front of me. She couldn't explain it. She'd try, but the words wouldn't come out properly.`,
    quote: `"It's my head." "It won't stop." "I don't know what's wrong with me."`,
  },
  {
    stage: 'Asking for help',
    title: 'Left waiting while she got worse',
    body: `I did what you're supposed to do. I spoke to people who were meant to know what to do. I explained what I was seeing. I trusted that someone would listen — that there was a system in place to catch children before they fall too far. No urgency came. No early intervention. Just waiting, while something that could have been supported early turned into something much bigger.`,
    quote: `The system didn't move when she was struggling. It moved when she was breaking.`,
  },
  {
    stage: 'Crisis at home',
    title: 'The help that took her away',
    body: `The self-harm became part of everyday life. I stopped sleeping properly — listening, checking, making sure she was still safe, even in the night. It got to a point where that wasn't enough on its own. I thought support would come into our home, that we'd build something around her together. Instead, I was told the only way she could get the help she needed was for her to go into care.`,
    quote: `It didn't feel like help. It felt like losing her.`,
  },
  {
    stage: 'The system responds',
    title: 'When it became legal',
    body: `A Deprivation of Liberty Order. I sat in meetings listening to professionals use words like risk, supervision, restrictions — talking about a case, a situation to be managed, not about my daughter. She wasn't a problem. She was overwhelmed, struggling in a way she couldn't explain. Once a child becomes something that needs "managing," they stop being seen as a child, and start being seen as a risk.`,
    quote: `She was never the problem.`,
  },
  {
    stage: 'Ten placements',
    title: 'Every move took something from her',
    body: `Placement after placement, each one introduced as the one that would work. Each time I wanted to believe it, because I needed to. But the pattern repeated: she'd arrive scared, try to adjust, and then it would break down again. Ten placements. Ten times starting again. Eventually she stopped unpacking. She stopped trying to settle, because nothing lasted.`,
    quote: null,
  },
  {
    stage: 'Age 14',
    title: 'Locked away in a psychiatric unit',
    body: `She was placed in a locked PICU. Alarms, locked doors, staff constantly present, restraints, observation. It wasn't calm, and it wasn't the kind of therapeutic people imagine. She wasn't getting better — she was learning how to exist inside a system that didn't understand her. That isn't the same thing as healing.`,
    quote: null,
  },
  {
    stage: 'The High Court',
    title: 'Even the court saw it',
    body: `It reached the High Court, because no one could provide the safe, suitable, consistent placement she needed. It was serious enough that NHS England were ordered into the courtroom, and the BBC were allowed into the Royal Courts of Justice. The judge could see the failures. But no one stood up and said, "we failed her." That's when it became clear — this wasn't only happening to my daughter. It was happening to other families too.`,
    quote: null,
  },
  {
    stage: 'What actually helped',
    title: 'Family, not the system',
    body: `After everything — the placements, the restrictions, the courtrooms — it wasn't the system that helped her. It was her nan. A home. Consistency. Care that didn't feel forced. Somewhere she wasn't being managed, but understood. That's when things started to change. Not overnight, not perfectly, but differently — because she finally had what she'd needed all along.`,
    quote: `Someone who saw her — not her behaviour.`,
  },
]

function Journey() {
  return (
    <div className="page">
      <header className="site-header">
        <div className="wrap header-row">
          <img
            src={socialInnovationLogo}
            alt="Social Innovation CIC"
            className="brand-mark"
          />
          <div>
            <span className="brand">SafeSpace NeuroPathway</span>
            <span className="brand-sub">A prevention-first space for young minds</span>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="wrap">
          <p className="eyebrow">My story</p>
          <h1>She Wasn&rsquo;t the Problem</h1>
          <p className="subtitle">
            Through my eyes — a mother fighting a system that failed her
            child. This is why I&rsquo;m building SafeSpace NeuroPathway.
          </p>
        </div>
      </section>

      <section className="support-note">
        <div className="wrap">
          <p>
            <strong>Before you read on:</strong> this page speaks honestly
            about self-harm, crisis, and the care system. If you or a young
            person you know needs support right now, you don&rsquo;t have to
            wait: <strong>Samaritans</strong> — 116 123 (free, 24/7) ·{' '}
            <strong>Shout</strong> — text 85258 · <strong>Childline</strong> —
            0800 1111.
          </p>
        </div>
      </section>

      <section className="prologue">
        <div className="wrap narrow">
          <h2>I did everything right</h2>
          <p>
            I noticed the changes. I didn&rsquo;t tell myself she was just
            being difficult, or emotional, or going through a phase. I
            asked for help, over and over. I trusted that someone would
            take it seriously — that there was a system in place to catch
            children before they fall too far.
          </p>
          <p>
            I can trace it back to the exact point where things could have
            been different. Where someone could have stepped in. But they
            didn&rsquo;t. And by the time anyone moved, everything had
            already started to fall apart.
          </p>
        </div>
      </section>

      <section className="timeline">
        <div className="wrap narrow">
          <h2>The journey</h2>
          <ol>
            {timeline.map((item) => (
              <li key={item.title} className="timeline-item">
                <p className="stage">{item.stage}</p>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
                {item.quote && <blockquote>{item.quote}</blockquote>}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="prevention">
        <div className="wrap narrow">
          <h2>Prevention is the cure</h2>
          <p>
            I&rsquo;ve gone over this story more times than I can count.
            Every stage, every decision, every moment where things could
            have gone differently. The truth is simple: this didn&rsquo;t
            have to happen like this. If someone had listened earlier. If
            support had been put in place when I first asked. If someone
            had seen her as a child in distress instead of a problem to
            manage — we wouldn&rsquo;t have ended up here.
          </p>
          <p>
            I can&rsquo;t change what happened. What I can change is what
            happens next — for every child who is still being missed,
            every parent still asking for help, every family still
            waiting for someone to listen.
          </p>
        </div>
      </section>

      <section className="building">
        <div className="wrap narrow">
          <h2>Why I&rsquo;m building SafeSpace NeuroPathway</h2>
          <p>
            No child should ever have to reach crisis to be taken
            seriously. SafeSpace NeuroPathway is my answer to that — a
            gentle, child-facing space where kids can name and track how
            they&rsquo;re feeling long before it becomes a crisis, and
            where the small, early signs I saw and couldn&rsquo;t get
            anyone to act on don&rsquo;t get missed again.
          </p>
          <p>
            It won&rsquo;t replace professional support. It&rsquo;s meant
            to sit alongside families and services, giving children a safe
            way to be heard early — and giving the adults around them
            something real to act on, before waiting turns into crisis.
          </p>
        </div>
      </section>

      <section className="today">
        <div className="wrap narrow">
          <h2>Where things stand today</h2>
          <p>
            SafeSpace NeuroPathway is still in its earliest days. I&rsquo;m
            building it in the open, shaped directly by what I lived
            through and by what other families keep telling me they
            need. There&rsquo;s a long way to go — but every piece of it
            starts from the same idea: catch it early, believe the child,
            and don&rsquo;t wait for a crisis to take it seriously.
          </p>
        </div>
      </section>

      <footer className="site-footer">
        <div className="wrap footer-row">
          <img
            src={socialInnovationLogo}
            alt="Social Innovation CIC — what you think you become, what you feel you attract"
            className="footer-mark"
          />
          <div>
            <p>Shared with care, for every family still waiting to be heard.</p>
            <p className="fine-print">SafeSpace NeuroPathway · A Social Innovation CIC project</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Journey
