"""
Regenerates the JSON seed files under src/main/resources/seed.

The JSON is the source of truth that SeedLoader reads - this script only exists so
the set can be rebuilt or resized without hand-editing a hundred records. Run it,
review the diff, commit the JSON.

Every profile and post it produces is fictional and is labelled that way in the
copy itself ("Example profile", "Illustrative case", "No real patient"), matching
how the UI already presents them.

    python tools/generate_seed.py
"""

import io
import json
import os
import random

SEED = 20261014
OUT = os.path.join(os.path.dirname(__file__), "..", "src", "main", "resources", "seed")

# (city, state) pairs, kept correct - the state filter is only useful if they are.
PLACES = [
    ("Bengaluru", "Karnataka"), ("Mysuru", "Karnataka"), ("Mangaluru", "Karnataka"),
    ("Mumbai", "Maharashtra"), ("Pune", "Maharashtra"), ("Nagpur", "Maharashtra"),
    ("Nashik", "Maharashtra"), ("Chennai", "Tamil Nadu"), ("Coimbatore", "Tamil Nadu"),
    ("Madurai", "Tamil Nadu"), ("Kochi", "Kerala"), ("Thiruvananthapuram", "Kerala"),
    ("Kozhikode", "Kerala"), ("Hyderabad", "Telangana"), ("Warangal", "Telangana"),
    ("New Delhi", "Delhi"), ("Gurugram", "Haryana"), ("Faridabad", "Haryana"),
    ("Jaipur", "Rajasthan"), ("Udaipur", "Rajasthan"), ("Ahmedabad", "Gujarat"),
    ("Surat", "Gujarat"), ("Vadodara", "Gujarat"), ("Kolkata", "West Bengal"),
    ("Siliguri", "West Bengal"), ("Bhubaneswar", "Odisha"), ("Cuttack", "Odisha"),
    ("Lucknow", "Uttar Pradesh"), ("Varanasi", "Uttar Pradesh"), ("Kanpur", "Uttar Pradesh"),
    ("Patna", "Bihar"), ("Bhopal", "Madhya Pradesh"), ("Indore", "Madhya Pradesh"),
    ("Chandigarh", "Chandigarh"), ("Amritsar", "Punjab"), ("Ludhiana", "Punjab"),
    ("Dehradun", "Uttarakhand"), ("Guwahati", "Assam"), ("Raipur", "Chhattisgarh"),
    ("Ranchi", "Jharkhand"), ("Visakhapatnam", "Andhra Pradesh"), ("Vijayawada", "Andhra Pradesh"),
    ("Panaji", "Goa"), ("Shimla", "Himachal Pradesh"), ("Srinagar", "Jammu & Kashmir"),
]

# specialty -> the search chip it answers to (None = matched by text only)
SPECIALTIES = {
    "Small Animal Medicine": None,
    "Veterinary Surgery": "Surgery",
    "Veterinary Dermatology": "Dermatology",
    "Animal Nutrition": "Nutrition",
    "Emergency & Critical Care": None,
    "Veterinary Dentistry": None,
    "Veterinary Pathology": None,
    "Veterinary Research": None,
    "Equine Medicine": "Equine",
    "Livestock Health": "Livestock",
    "Wildlife Medicine": "Wildlife",
    "Preventive Medicine": "Preventive",
    "Diagnostic Imaging": "Imaging",
    "Cardiology": None,
    "Feline Medicine": None,
    "Veterinary Behaviour": None,
}

FIRST = [
    "Ananya", "Arjun", "Priya", "Rohan", "Meera", "Kabir", "Nidhi", "Sunita", "Sanjay",
    "Aditya", "Gurpreet", "Vikram", "Farah", "Tanvi", "Imran", "Lakshmi", "Swati",
    "Ramesh", "Amit", "Isha", "Harpreet", "Yash", "Ritika", "Tanya", "Deepa", "Nikhil",
    "Shreya", "Manish", "Kavya", "Rahul", "Pooja", "Siddharth", "Neha", "Vivek",
    "Anjali", "Karthik", "Divya", "Rajesh", "Sneha", "Vinod", "Megha", "Alok",
    "Bhavna", "Dinesh", "Rekha", "Nitin", "Shalini", "Gopal", "Smita", "Prakash",
    "Aarti", "Suresh", "Kiran", "Mohan", "Jyoti", "Ashok", "Leela", "Varun", "Asha",
    "Naveen", "Rupa", "Sameer", "Geeta", "Pranav", "Usha",
]

LAST = [
    "Sharma", "Mehta", "Nair", "Iyer", "Rao", "Das", "Gupta", "Bose", "Kulkarni",
    "Menon", "Singh", "Qureshi", "Joshi", "Shaikh", "Varma", "Mishra", "Gowda",
    "Patel", "Gill", "Trivedi", "Kapoor", "Bhatt", "Reddy", "Banerjee", "Chauhan",
    "Pillai", "Desai", "Saxena", "Thakur", "Dutta",
]

BIOS = [
    "Example profile. {spec} in day-to-day practice, with an interest in getting the basics right before reaching for a test.",
    "Example profile. Works in {spec} and writes here about the cases that changed how the team approaches a problem.",
    "Example profile. {spec}, with a focus on explaining a plan clearly enough that the family can follow it at home.",
    "Example profile. Practising {spec} in {city}, and interested in how colleagues elsewhere handle the same questions.",
    "Example profile. {spec}, teaching, and a long-standing habit of writing up what did not go to plan.",
]

CASE_BODIES = [
    ("Illustrative case: a senior Labrador with gradual weight loss and increased thirst. Which baseline tests would you prioritise, and how would you stage the work-up for a cost-conscious owner? No real patient is represented.",
     "Start with urine specific gravity before anything expensive. Stage the work-up so the owner can stop at any point with a usable answer."),
    ("Teaching scenario: a young cat with recurrent itching around the face and neck. What would your elimination plan look like, and how do you keep owners motivated for eight weeks? No real patient.",
     "Write the eight-week plan down and give the owner a copy. Verbal instructions do not survive week three."),
    ("Illustrative case: a dairy cow with a sudden drop in milk yield during the monsoon. How do environment, feed changes and herd history shape your first questions? De-identified teaching scenario.",
     "Walk the shed before you take a sample. Intake and footing explain more monsoon yield drops than infection does."),
    ("Illustrative case: a backyard poultry flock with sudden reduced egg production. What biosecurity and history questions come first? Fictional scenario for discussion.",
     "Ask who else visited the flock that week. Biosecurity history is usually the fastest route to the answer."),
    ("Teaching scenario: an adult dog with intermittent forelimb lameness that only shows after exercise on hard ground. Where would you start? De-identified for peer discussion.",
     "Film the gait on the owner's phone before the visit. Lameness that hides in the consult room shows up on video."),
    ("Illustrative case: a cat presented for a routine dental that turned out to have a significant heart murmur. How does that change your anaesthetic plan? No real patient.",
     "A new murmur postpones an elective. Image first, then decide - the dental will wait a fortnight."),
    ("Teaching scenario: a horse with weight loss over a season despite good grazing. Which parasitology and dentistry questions come first? Fictional case.",
     "Check the teeth before the worm count. Quidding explains a lot of unexplained equine weight loss."),
    ("Illustrative case: a rescue puppy with chronic diarrhoea through its first month in a new home. How do you separate diet, parasites and stress? De-identified teaching scenario.",
     "Change one variable at a time. A simultaneous diet change and wormer tells you nothing about which worked."),
    ("Teaching scenario: a goat herd with a rise in lameness after a wet fortnight. What would your footbath protocol and follow-up look like? Fictional scenario.",
     "Footbath concentration matters less than how often the solution is actually changed."),
    ("Illustrative case: a middle-aged cat losing weight with a good appetite. Which three tests give you the most for the owner's money? No real patient is represented.",
     "Thyroid, glucose and a urine sample answer most of these before any imaging."),
    ("Teaching scenario: a dog that collapses only on hot afternoon walks. How would you structure the cardiac versus respiratory work-up? De-identified for peer discussion.",
     "Ask for ambient temperature and time of day. The pattern narrows the differential more than the first test will."),
    ("Illustrative case: a rabbit that has stopped eating overnight. What is your first hour, and what do you tell the owner on the phone? Fictional scenario for discussion.",
     "Treat gut stasis as an emergency on the phone, not after arrival. The first hour is the one that counts."),
]

POST_BODIES = [
    "Grateful for colleagues who pick up the phone for a second opinion. Collaboration is the best continuing education.",
    "Small reminder from today: the quiet five minutes spent explaining a treatment plan saves an hour of confusion later.",
    "The hardest part of this job is rarely the diagnosis. It is finding the version of the plan a family can actually follow.",
    "Low-stress handling is not a nice-to-have. A calm patient gives you a better examination and a more honest heart rate.",
    "Writing up the cases that did not go to plan has taught me more than the ones that did.",
    "A good history takes longer than a quick examination and is worth every minute.",
    "If the owner cannot afford the gold standard, the second-best plan they will complete beats the best one they will abandon.",
    "Reminder that nurses often spot the deterioration first. Listening to the team is a clinical skill.",
    "Every clinic should have a written anaesthetic checklist. Memory is not a safety system.",
    "Preventive conversations are undervalued. Most of what we treat was visible months earlier.",
    "On referral letters: say what you are worried about, not only what you found.",
    "Something I keep relearning - weigh the patient properly before calculating anything.",
    "Peer discussion beats a textbook for the awkward cases that do not read the chapter.",
    "The best outcome measure is whether the animal is comfortable at home, not whether the numbers normalised.",
    "Spent the afternoon teaching students to palpate slowly. Speed comes later.",
]

STORY_BODIES = [
    "Illustrative story. Morning list ready, kit laid out, first patient on its way in.",
    "Illustrative story. Quiet hour in the lab, working through this morning's slides.",
    "Illustrative story. Out on farm before sunrise - herd checks go better before the heat.",
    "Illustrative story. Late evening in the clinic, finishing notes and a cold cup of tea.",
    "Illustrative story. Theatre reset and ready for tomorrow.",
    "Illustrative story. Teaching afternoon with final-year students.",
    "Illustrative story. Rain all day, and a waiting room full of wet dogs.",
    "Illustrative story. First coffee, second opinion, third attempt at the same radiograph.",
]

VIDEO_BODIES = [
    "Illustrative clip, not real clinical footage. Three handling steps that help an anxious dog settle before an examination.",
    "Illustrative clip, not real clinical footage. Making a feline examination kinder with a towel and short pauses.",
    "Illustrative clip, not real clinical footage. A distal limb bandage that stays on - tension matters more than layers.",
    "Illustrative clip, not real clinical footage. Walking a milking routine and pointing out where contamination creeps in.",
    "Illustrative clip, not real clinical footage. Positioning for a thoracic study that does not need repeating.",
    "Illustrative clip, not real clinical footage. A two-minute body condition scoring walkthrough.",
]

PHOTOS = [
    "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=1000&q=80",
]

# Verified to actually play in a browser. The mixkit URLs that ship in the
# frontend's sampleData.js return 403 and were silently producing dead players.
VIDEOS = [
    "https://www.w3schools.com/html/mov_bbb.mp4",
    "https://www.w3schools.com/html/movie.mp4",
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
]

TOPICS = ["Dermatology", "Surgery", "Livestock", "Equine", "Imaging", "Nutrition", "Wildlife", "Preventive"]


def slugify(name):
    return name.lower().replace("dr. ", "").replace(" ", "-").replace(".", "")


def build():
    rnd = random.Random(SEED)

    # ---------------------------------------------------------------- vets
    vets, used = [], set()
    specialties = list(SPECIALTIES)
    while len(vets) < 65:
        name = f"Dr. {rnd.choice(FIRST)} {rnd.choice(LAST)}"
        slug = slugify(name)
        if slug in used:
            continue
        used.add(slug)
        city, state = PLACES[len(vets) % len(PLACES)]
        spec = specialties[len(vets) % len(specialties)]
        vets.append({
            "slug": slug,
            "fullName": name,
            "specialty": spec,
            "city": city,
            "state": state,
            "bio": rnd.choice(BIOS).format(spec=spec, city=city),
            # Generated initials, not photographs. A stock photo service returns
            # pictures of real people, and captioning a real face as a fictional
            # doctor misrepresents that person - these are drawn from the name.
            "avatarUrl": ("https://api.dicebear.com/7.x/initials/svg"
                          f"?seed={name.replace('Dr. ', '').replace(' ', '%20')}"
                          "&backgroundColor=0f5132,1b4332,14532d,166534&textColor=ffffff"),
            # A handful verified, so "Verified only" filters to something.
            "verified": len(vets) % 9 == 4,
            "daysAgo": 60 + rnd.randrange(600),
        })

    by_spec = {}
    for v in vets:
        by_spec.setdefault(v["specialty"], []).append(v)

    # ------------------------------------------------------------- clinics
    clinics = []
    for v in vets[:22]:
        clinics.append({
            "vetSlug": v["slug"],
            "name": f"{v['fullName'].replace('Dr. ', '').split()[-1]} {('Veterinary Clinic' if 'Small' in v['specialty'] else 'Specialty Centre')}",
            "location": f"{v['city']}",
            "address": f"{v['city']}, {v['state']}",
            "phone": f"+91 {rnd.randrange(70000, 99999)} {rnd.randrange(10000, 99999)}",
            "openingHours": rnd.choice([
                "Mon-Sat, 9:00 AM - 8:00 PM",
                "Mon-Sun, 10:00 AM - 7:00 PM",
                "Open 24 hours",
                "Tue-Sun, 10:00 AM - 6:00 PM",
            ]),
            "services": ", ".join(rnd.sample([
                "Preventive health checks", "Vaccination", "Diagnostics", "Surgery",
                "Dental care", "Nutrition counselling", "Emergency triage", "Imaging",
            ], 4)),
            "about": "Example clinic page. Fictional listing used to show how a professional page looks.",
            "photoUrl": rnd.choice(PHOTOS),
        })

    # --------------------------------------------------------------- posts
    posts = []
    hours = 2

    def topic_for(vet):
        mapped = SPECIALTIES.get(vet["specialty"])
        return mapped if mapped else rnd.choice(TOPICS)

    # 34 clinical cases, matching the reference. Roughly half carry takeaways so
    # the "Has takeaways" filter cuts the set rather than changing nothing.
    for i in range(34):
        vet = vets[(i * 7) % len(vets)]
        body, takeaway = CASE_BODIES[i % len(CASE_BODIES)]
        posts.append({
            "ref": f"case-{i + 1:03d}",
            "authorSlug": vet["slug"],
            "type": "CLINICAL_CASE",
            "category": "Clinical perspectives",
            "body": body,
            "mediaUrl": rnd.choice(PHOTOS) if i % 3 == 0 else None,
            "consentReviewed": True,
            "takeaways": takeaway if i % 2 == 0 else None,
            "topic": topic_for(vet),
            "viewCount": rnd.randrange(20, 900),
            "appreciationCount": 0,
            "commentCount": 0,
            "shareCount": rnd.randrange(0, 14),
            "hoursAgo": hours,
        })
        hours += rnd.randrange(3, 11)

    for i in range(60):
        vet = vets[(i * 11 + 3) % len(vets)]
        posts.append({
            "ref": f"post-{i + 1:03d}",
            "authorSlug": vet["slug"],
            "type": "POST",
            "category": "From the community",
            "body": POST_BODIES[i % len(POST_BODIES)],
            "mediaUrl": rnd.choice(PHOTOS) if i % 4 == 0 else None,
            "consentReviewed": False,
            "takeaways": None,
            "topic": topic_for(vet),
            "viewCount": rnd.randrange(10, 700),
            "appreciationCount": 0,
            "commentCount": 0,
            "shareCount": rnd.randrange(0, 10),
            "hoursAgo": hours,
        })
        hours += rnd.randrange(2, 8)

    for i in range(25):
        vet = vets[(i * 5 + 1) % len(vets)]
        posts.append({
            "ref": f"story-{i + 1:03d}",
            "authorSlug": vet["slug"],
            "type": "STORY",
            "category": "Moments",
            "body": STORY_BODIES[i % len(STORY_BODIES)],
            "mediaUrl": rnd.choice(PHOTOS),
            "consentReviewed": False,
            "takeaways": None,
            "topic": topic_for(vet),
            "viewCount": rnd.randrange(20, 200),
            "appreciationCount": 0,
            "commentCount": 0,
            "shareCount": 0,
            "hoursAgo": (i + 1) * 2,
        })

    for i in range(17):
        vet = vets[(i * 13 + 2) % len(vets)]
        posts.append({
            "ref": f"video-{i + 1:03d}",
            "authorSlug": vet["slug"],
            "type": "SHORT_VIDEO",
            "category": "Learning",
            "body": VIDEO_BODIES[i % len(VIDEO_BODIES)],
            "mediaUrl": VIDEOS[i % len(VIDEOS)],
            "consentReviewed": True,
            "takeaways": "Watch the handler's hands, not the patient - that is where the technique is." if i % 3 == 0 else None,
            "topic": topic_for(vet),
            "viewCount": rnd.randrange(100, 1500),
            "appreciationCount": 0,
            "commentCount": 0,
            "shareCount": rnd.randrange(2, 30),
            "hoursAgo": hours,
        })
        hours += rnd.randrange(6, 20)

    # ------------------------------------------------- comments & reactions
    comments, appreciations = [], []
    for post in posts:
        if post["type"] == "STORY":
            continue
        n = rnd.randrange(0, 4)
        for j in range(n):
            author = vets[rnd.randrange(len(vets))]
            if author["slug"] == post["authorSlug"]:
                continue
            comments.append({
                "postRef": post["ref"],
                "authorSlug": author["slug"],
                "body": rnd.choice([
                    "Useful framing - I would add that owner compliance decides most of this.",
                    "We see this pattern often. Thanks for writing it up.",
                    "Would you image first, or start treatment and reassess at two weeks?",
                    "Good reminder. I have been guilty of skipping that step when the list is long.",
                    "Sharing this with our team - the sequencing is the part people get wrong.",
                    "Agreed. The history does more work here than any single test.",
                ]),
                "hoursAgo": max(1, post["hoursAgo"] - rnd.randrange(1, 3)),
            })

        likers = rnd.sample(vets, rnd.randrange(0, 12))
        slugs = [v["slug"] for v in likers if v["slug"] != post["authorSlug"]]
        if slugs:
            appreciations.append({"postRef": post["ref"], "vetSlugs": slugs})

    # ------------------------------------------------------------- follows
    follows, seen = [], set()
    for v in vets:
        for other in rnd.sample(vets, rnd.randrange(2, 9)):
            pair = (v["slug"], other["slug"])
            if v["slug"] == other["slug"] or pair in seen:
                continue
            seen.add(pair)
            follows.append({"followerSlug": pair[0], "followingSlug": pair[1]})

    return vets, clinics, posts, comments, appreciations, follows


def write(name, rows):
    path = os.path.join(OUT, name)
    with io.open(path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(json.dumps(rows, indent=2, ensure_ascii=False) + "\n")
    print(f"{name:24} {len(rows):5} rows")


if __name__ == "__main__":
    vets, clinics, posts, comments, appreciations, follows = build()
    write("vet-profiles.json", vets)
    write("clinics.json", clinics)
    write("posts.json", posts)
    write("comments.json", comments)
    write("appreciations.json", appreciations)
    write("follows.json", follows)

    from collections import Counter
    print("\npost types:", dict(Counter(p["type"] for p in posts)))
    print("with takeaways:", sum(1 for p in posts if p["takeaways"]))
    print("verified vets:", sum(1 for v in vets if v["verified"]))
    print("states:", len({v["state"] for v in vets}))
