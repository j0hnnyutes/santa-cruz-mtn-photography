// One-time script: publishes the initial batch of blog posts (3 local
// guides, 1 drone piece, 3 live-music pieces). Safe to re-run — it upserts
// by slug rather than blindly inserting, unlike the photo ingestion script.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const COVER = {
  cliffs: "https://fj6wovb61c17rq4r.public.blob.vercel-storage.com/gallery/c0d198a9-7c78-4341-9aa1-c8355f4a3b28.jpg",
  arch: "https://fj6wovb61c17rq4r.public.blob.vercel-storage.com/gallery/2ffa4bbd-778f-475e-b34c-abb22e1d9edd.jpg",
  bigBasinSign: "https://fj6wovb61c17rq4r.public.blob.vercel-storage.com/gallery/6b751901-49dd-44be-9635-bc4ca26deacd.jpg",
  birdSunset: "https://fj6wovb61c17rq4r.public.blob.vercel-storage.com/gallery/29ee0091-e2df-48d7-b437-fc37cd919d56.jpg",
  liveBand: "https://fj6wovb61c17rq4r.public.blob.vercel-storage.com/gallery/4dcd24ee-e4e1-4302-bc61-6b3d5a4817c8.jpg",
  boardwalk: "https://fj6wovb61c17rq4r.public.blob.vercel-storage.com/gallery/cd74d4e1-48e6-4075-9ec5-48f6e579b651.jpg",
  crowdSunset: "https://fj6wovb61c17rq4r.public.blob.vercel-storage.com/gallery/e6338b28-f60b-4894-8cf7-c732ce25aa6f.jpg",
};

const posts = [
  {
    slug: "best-spots-sunset-photos-west-cliff-drive-santa-cruz",
    title: "Best Spots for Sunset Photos Along West Cliff Drive",
    excerpt:
      "West Cliff Drive is the easiest sunset photography in Santa Cruz to get right — here's where along the bluff to stand, and when.",
    coverImageUrl: COVER.cliffs,
    coverImageAlt: "Golden hour light on coastal cliffs in Santa Cruz, California",
    content: `West Cliff Drive runs along the bluffs from the Santa Cruz Wharf out past Lighthouse Point, and it's about as reliable a sunset as you'll find on this coast — west-facing, unobstructed, and lined with enough rock and cypress to actually frame a shot instead of just pointing a camera at an empty horizon.

## Lighthouse Point

The Mark Abbott Memorial Lighthouse sits right on the point, and it's the obvious anchor for a shot here — silhouette the tower against the last color in the sky, or work in close to the tide pools below it when the light's still warm. This stretch also draws a crowd most clear evenings, which isn't a bad thing photographically: a scattering of people watching the sunset from the point gives a wide shot some scale and life it wouldn't have empty.

## The cliffs south of the lighthouse

Heading south toward Steamer Lane, the bluffs get more textured — layered sandstone, ice plant spilling over the edge, surfers still out catching last light. This is where I'd go for a shot that's more about the coastline itself than any single landmark. Get low, let the foreground rock lead the eye out to the water.

## Natural Bridges, at the far end

If you're willing to drive the length of West Cliff, Natural Bridges State Beach is the payoff — a sea arch that catches the sunset almost directly through the opening on the right time of year. It deserves its own post (and has one), but it's worth mentioning here as the natural end point of a West Cliff evening.

## Timing

Arrive earlier than you think you need to. The 30 minutes before sunset is when the cliffs themselves catch the best light — everything goes warm and the shadows get long and interesting. By the time the sun actually touches the water, you're shooting silhouettes and afterglow, which is its own thing but a completely different shot than what you got twenty minutes earlier. I usually plan to be in position at least 45 minutes before sunset and stay 20 minutes after — the color after the sun drops can outlast what most people think is "done."

## Fog is not your enemy

Santa Cruz fog rolls in fast and unevenly along this stretch, and it can look like it's ruining your evening right up until it doesn't — fog diffusing the last light into a soft wash of color is one of the more distinctive looks you can get here, and you won't get it on a clear night. If it's foggy, stay. Don't pack up early.

If you want photos of this coastline that go beyond a phone snapshot from the sidewalk — for yourself, for a shoot, or aerial coverage of the whole bluff from a drone — [get in touch](mailto:law138@santacruzmtnphotography.com).`,
  },
  {
    slug: "photographers-guide-natural-bridges-state-beach",
    title: "A Photographer's Guide to Natural Bridges State Beach",
    excerpt:
      "The sea arch, the tide pools, and the monarch grove — what's actually worth photographing at Natural Bridges, and when to go.",
    coverImageUrl: COVER.arch,
    coverImageAlt: "A natural rock arch along the Santa Cruz, California coastline at dusk",
    content: `Natural Bridges is one of those places that photographs well almost by accident — you point a camera at the arch and get something decent even on a bad day. But there's a real difference between a decent shot and the shot the place is actually capable of, and it comes down to knowing what to wait for.

## The arch itself

There's only one bridge left standing now (the park's name is a bit of a relic — erosion has taken the others over the decades), but it's the whole reason to come. Shoot it straight-on from the main overlook for the classic, symmetrical version, or walk down onto the sand and shoot from an angle where the arch frames something behind it — the horizon, a wave breaking, the sunset itself if you time it right. The opening faces roughly the right direction to catch late sun through it for a few weeks around the equinoxes; outside that window, you're shooting the arch lit from the side rather than through it, which is still good, just different.

## Low tide is when this place opens up

Check a tide chart before you go. At low tide, the reef in front of the beach exposes tide pools full of anemones, crabs, and the occasional starfish, and you can walk out onto rock that's normally underwater. This is genuinely one of the better tide pool spots on this stretch of coast, and almost nobody photographs it well because they show up at high tide when there's nothing to see but water against the cliff.

## The monarch grove

Less obvious, and easy to miss if you only go for the beach: there's a eucalyptus grove just up from the parking lot that hosts an overwintering monarch butterfly colony, roughly October through February. On a warm, sunny day in season, the trees can be genuinely thick with them. It's a completely different kind of shot from the coastal stuff — quieter, more macro, worth the short walk even if butterflies aren't usually your subject.

## Practical notes

Parking fills up fast on weekends, especially around sunset — this is a small state beach with a small lot, and it's popular for good reason. Go on a weekday if you can, or get there with real time to spare. And plan to leave after the show fully ends — the color often builds for a good ten minutes after the sun's actually down.

If you're planning a shoot here — portraits with the arch as a backdrop, or aerial coverage of the whole reef and the coastline around it — [reach out](mailto:law138@santacruzmtnphotography.com) and I can help plan around the tide and the light.`,
  },
  {
    slug: "big-basin-redwoods-since-czu-fire",
    title: "Big Basin Redwoods: What It Looks Like Since the CZU Fire",
    excerpt:
      "The 2020 CZU Lightning Complex fire changed Big Basin permanently. Here's what I've seen photographing the park's recovery.",
    coverImageUrl: COVER.bigBasinSign,
    coverImageAlt: "Big Basin Redwoods State Park sign, Santa Cruz Mountains",
    content: `Big Basin was the oldest state park in California, and in August 2020 the CZU Lightning Complex fire burned through nearly all of it. The park was closed for years afterward, and even now that parts of it have reopened, it doesn't look like the Big Basin most of us grew up with. I've spent a fair amount of time out there since with a camera, and it's worth talking honestly about what you'll actually find if you go.

## The old-growth redwoods mostly survived

This is the part that surprises people: coast redwoods are remarkably fire-adapted, and most of the park's ancient trees — some over a thousand years old — are still standing and, in many cases, already resprouting green growth straight out of blackened bark. It's a strange, striking thing to photograph: a trunk that's clearly been through an intense fire, with bright new foliage sprouting directly from the char. That contrast, more than anything, is the story of this park right now.

## The understory is a different story

Most of the smaller trees, brush, and forest floor burned completely, which means a lot of the park reads as much more open and exposed than it used to — you can see much further into the forest than you could before 2020, with standing dead trees (snags) scattered through it. It's not the deep, dark, enclosed redwood forest people expect. It's something rawer, and depending on your eye, either less beautiful or more interesting than the original — I lean toward the latter, especially at golden hour when low light rakes through gaps in the canopy that didn't used to exist.

## Access is still limited

Large sections of the park remain closed or day-use only as infrastructure gets rebuilt, and trail conditions change as recovery work continues — check the state parks website for current status before you go, not an old trail map. Some of the most-photographed pre-fire spots (the old park headquarters, certain groves) may not be accessible the way they once were.

## Why photograph it at all

Because this is a real, ongoing story about a place a lot of people care about, and most of the photos still circulating online are pre-fire — they don't show what's actually there now. There's value in documenting a forest recovering from a fire this severe, both for anyone who loved the old Big Basin and wants to understand what's changed, and simply as a record of how a redwood ecosystem comes back from something like this.

If you're interested in a guided shoot out there, or aerial footage of the burn scar and regrowth from above, [get in touch](mailto:law138@santacruzmtnphotography.com).`,
  },
  {
    slug: "aerial-drone-photography-santa-cruz-weddings-events-land-surveys",
    title: "Aerial Drone Photography in Santa Cruz: Weddings, Events & Land Surveys",
    excerpt:
      "What a drone actually adds to wedding coverage, event photography, and land surveying in the Santa Cruz Mountains — and what to know before booking one.",
    coverImageUrl: COVER.birdSunset,
    coverImageAlt: "A bird flying over the Santa Cruz, California coastline at sunset",
    content: `A drone isn't a gimmick add-on to a shoot — used well, it's the only way to get certain shots at all. I fly one regularly alongside ground photography, and the honest answer to "do I need aerial coverage" depends a lot on what you're actually trying to capture.

## Weddings

The Santa Cruz Mountains have venues — vineyards, redwood groves, coastal bluffs — where the setting is genuinely half the reason people book them, and ground-level photos can't show the whole property the way a drone can. A wide aerial shot of the ceremony space, the guests seated, the surrounding land, gives you a photo that simply doesn't exist any other way. I typically fly during setup or cocktail hour rather than the ceremony itself — it's quiet, respectful, and doesn't put a drone buzzing overhead during vows.

## Events and live shows

For a concert, festival, or large gathering, an aerial shot communicates scale in a way nothing else does — how many people showed up, how the crowd filled the space, the layout of the whole event. It's also just a different, more dynamic angle to cut into event coverage instead of every photo being shot from the same eye-level vantage point in the crowd.

## Land surveying

This is the less glamorous but genuinely useful side of drone work: property owners, real estate listings, and land assessments all benefit from clear aerial imagery — boundary lines, terrain, tree cover, structures, drainage. A drone can cover a property in minutes that would take hours to walk and photograph from the ground, and it gives you a straight-down or angled overview that's actually useful for planning, not just pretty.

## What to know before booking

- **Airspace matters.** Some areas — near airports, over crowds beyond certain limits, within some parks — have real restrictions on where a drone can legally fly. A professional operator plans around this; it's worth asking.
- **Weather is a real constraint.** Wind and rain ground a drone well before they'd stop ground photography. If aerial shots matter to you, it's worth having a rough backup plan for a windy day.
- **It's a complement, not a replacement.** The best coverage of a wedding or event mixes aerial shots in with ground-level, candid, and posed work — a whole shoot that's only drone footage misses everything that actually happens at eye level, which is usually most of the emotion.

If you're planning an event, a wedding, or need aerial coverage of a property in the Santa Cruz Mountains, [reach out](mailto:law138@santacruzmtnphotography.com) and we can talk through what's actually worth flying for.`,
  },
  {
    slug: "photographing-live-music-lighthouse-point-summer-concerts",
    title: "Photographing Live Music at Lighthouse Point's Free Summer Concerts",
    excerpt:
      "Santa Cruz's free summer concerts at Lighthouse Point draw a crowd for the sunset as much as the music — here's what shooting them is actually like.",
    coverImageUrl: COVER.liveBand,
    coverImageAlt: "A live band performing outdoors in Santa Cruz, California",
    content: `There's a specific kind of golden-hour light that shows up at Lighthouse Point on a clear summer evening, and it turns even an ordinary local band into something worth photographing. Free outdoor concerts on the point are a genuine Santa Cruz tradition, and shooting them has become some of my favorite regular work.

## The setting does a lot of the work

Most concert photography is fighting bad venue lighting — dark rooms, harsh stage lights, a crowd that blocks every angle. Lighthouse Point flips that: you've got open sky, the ocean behind the band, and if you time it right, direct sunset light hitting the performers and the crowd at the same time. A wide shot with the lighthouse, the band, and the ocean all in frame together is a shot that just doesn't exist at an indoor venue.

## Shooting the crowd, not just the stage

Some of the best frames from these evenings aren't of the band at all — they're the crowd on the grass, kids running around, people set up on blankets watching the sun go down while the music plays behind them. It's a community event as much as a concert, and photographing it that way — wide, candid, capturing the whole scene — tells a more honest story than a tight shot of a guitarist would.

## Practical notes for shooting here

- **Light changes fast.** You'll go from full sun to alpenglow to blue hour over the course of one set. Keep adjusting rather than locking in settings early.
- **Get there before it starts.** The crowd fills in fast on a nice evening, and getting a clean angle on the stage gets harder by the minute once people start setting up chairs and blankets.
- **Backlight isn't a problem, it's the shot.** Shooting toward the sunset with the band in silhouette or rim-lit is often more interesting than a flat, front-lit shot — don't fight it by trying to expose for shadow detail on every frame.

If you're a band, an organizer, or just want your own event shot with this kind of light in mind, [get in touch](mailto:law138@santacruzmtnphotography.com).`,
  },
  {
    slug: "friday-night-bands-santa-cruz-beach-boardwalk",
    title: "Friday Night Bands on the Santa Cruz Beach Boardwalk",
    excerpt:
      "The Boardwalk's free summer concert series puts a stage right on the beach — a different kind of live-music shoot than anywhere else in town.",
    coverImageUrl: COVER.boardwalk,
    coverImageAlt: "The Santa Cruz Beach Boardwalk and Giant Dipper roller coaster",
    content: `The Santa Cruz Beach Boardwalk runs free concerts through the summer, and shooting them is a completely different exercise than a quiet sunset show at Lighthouse Point — this is bright lights, a moving crowd, rides running behind the stage, and a lot more visual noise to work with on purpose instead of against.

## Working with the Boardwalk itself as a backdrop

The obvious temptation is to shoot tight on the stage and crop everything else out, but the Boardwalk's whole identity — the Giant Dipper's silhouette, the carnival lights coming on as the sky darkens, the beach right there — is what makes this venue different from literally anywhere else a band could play. I try to get at least a handful of wide shots each set that place the music inside that whole scene, not isolated from it.

## Blue hour is the sweet spot

The concerts run into the evening, and the window right as the sky goes from sunset color into deep blue — with the ride lights and stage lights now reading as genuinely bright against a darkening sky instead of competing with full daylight — is when this venue photographs best. Earlier, natural light dominates and the string lights barely register. Too much later, you're working entirely with artificial light and losing the beach and sky in the frame.

## It's a family crowd, and that's part of the story

Unlike a lot of concerts, the Boardwalk's series draws families, kids dancing near the front, people who wandered over from the rides — it's a genuinely mixed, casual crowd rather than a dedicated concert audience. Photographing that atmosphere honestly — not just the band, but the specific, slightly chaotic, very Santa Cruz scene around them — is usually more interesting than a straightforward performance shot.

## A note on gear and crowds

This is a busier, more physically tight environment than most outdoor venues in town — expect to be shooting around people, strollers, and the general flow of Boardwalk foot traffic. Staying mobile and comfortable shooting handheld matters more here than at a seated or spread-out venue.

If you're playing the Boardwalk series, organizing a similar event, or want photos of your own event with this kind of energy, [reach out](mailto:law138@santacruzmtnphotography.com).`,
  },
  {
    slug: "what-its-like-shooting-live-music-santa-cruz",
    title: "What It's Like Shooting Live Music in Santa Cruz — Behind the Lens",
    excerpt:
      "Santa Cruz has an unusually good live music scene for its size. Here's what I've learned photographing it, venue by venue and set by set.",
    coverImageUrl: COVER.crowdSunset,
    coverImageAlt: "A crowd gathered at sunset for a live event on the Santa Cruz, California coast",
    content: `Santa Cruz punches well above its weight for a town this size when it comes to live music, and a lot of it happens outdoors, in daylight, in front of an ocean — which is a genuinely unusual set of conditions compared to shooting music almost anywhere else. Most live music photography assumes a dark room and stage lighting. Here, half the job is working with sun instead of against it.

## Candid over posed, almost always

The shows I enjoy shooting most aren't the ones where I'm trying to get a clean, posed hero shot of the lead singer — they're the ones where I'm catching something true: a drummer mid-hit, someone in the crowd closing their eyes to a song they clearly know every word to, a genuine laugh between bandmates between songs. That candid, in-the-moment style is what I lean on for most of my work generally, and live music is where it comes together most naturally — the energy is already there, the job is just catching it honestly rather than staging it.

## Daylight changes everything about the technical side

Shooting a band at 6pm in full sun requires almost the opposite instincts from shooting one at 10pm under stage lights. You're managing harsh shadows and blown highlights instead of low light and noise. You're watching the sun's angle change the whole shoot instead of a lighting rig that stays fixed. It's a genuinely different skill than typical concert photography, and it's most of what defines shooting music in this town specifically.

## The crowd is half the story

I've said this in a couple of the more specific posts on here about individual venues, but it's worth repeating as a general point: at outdoor, free, all-ages Santa Cruz shows, the audience is doing something worth photographing in its own right — dancing, watching the sunset, kids running around, people who clearly came for the setting as much as the band. A full set of live music coverage, to me, includes those frames, not just tight shots of the stage.

## If you're a musician or organizer

I shoot local bands, free community concerts, and private events with music — anything from a single set to a full multi-band evening. If you want photos that capture what the show actually felt like, not just proof it happened, [get in touch](mailto:law138@santacruzmtnphotography.com).`,
  },
];

async function main() {
  for (const post of posts) {
    const result = await prisma.post.upsert({
      where: { slug: post.slug },
      create: {
        ...post,
        published: true,
        publishedAt: new Date(),
      },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        coverImageUrl: post.coverImageUrl,
        coverImageAlt: post.coverImageAlt,
      },
    });
    console.log(`✓ ${result.slug}`);
  }
  console.log(`\nDone — ${posts.length} posts published.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
