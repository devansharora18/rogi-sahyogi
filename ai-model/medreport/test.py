from ollama import chat
from ollama import ChatResponse

def query_medical_ai(patient_description):
    response: ChatResponse = chat(model='medreport', messages=[
        {
            'role': 'user',
            'content': patient_description,
        },
    ])

    # Accessing the response content
    return response['message']['content'] if 'message' in response else "No content received"

if __name__ == "__main__":
    inputs = [
        
		"""
		Day 1: A Quiet Start
		Woke up a little later than usual today—felt like I needed the sleep. The past week’s been a bit hectic, so I guess my body was catching up. I had a slight headache right when I woke up, probably because of all the tension in my neck. It was one of those dull, constant headaches that’s not terrible, but enough to make you want to sit still for a while. 
		I started the morning with a cup of coffee, but it didn’t really help much. My sinus pressure’s been on and off today, too, so I think that’s contributing. It’s a little stuffy, like my face is wearing a heavy mask. I’ve been drinking lots of water, though, trying to keep things moving. 
		Work was pretty chill today. I had a few meetings in the morning, and honestly, I didn’t feel like I was fully tuned in. A little distracted. But I managed to get through it. By noon, the headache had dulled, and I felt like I could focus better. Got some good writing done for the project I’ve been working on, so I’ll count that as a win.
		In the afternoon, I decided to take a short walk outside. It was windy, and the air was a little cooler than expected, but it felt nice to clear my head. I came back feeling better, even though my sinuses are still a bit congested. 
		Dinner was just leftovers—nothing fancy. And then I ended up watching a few episodes of a show I’ve been meaning to finish. My brain just needed something easy. It’s been one of those days where I couldn’t really focus on anything too challenging.
		Overall, a pretty quiet day. No big highs or lows, just steady. I’m hoping tomorrow feels a little better health-wise. 

		---

		Day 2: Getting Some Energy Back
		Woke up this morning and immediately felt more energized than yesterday, though the headache’s still hanging around in the background. It’s not as intense now, just more of a faint throb if I think about it too much. The sinus thing is still there, but not as bad—mostly just a little stuffy. I actually got up early today, before my alarm even went off, which feels rare for me lately.
		I had a solid breakfast—eggs, toast, and some fruit—and that gave me a good start to the day. Got into a bit of work first thing, responding to emails and handling a few tasks that I’d been putting off. Felt pretty productive, so that was a good win. 
		Around lunch, I took a break and called a friend I hadn’t talked to in a while. We caught up for about half an hour, and it was nice to have a laugh and hear about what’s been going on in their life. Felt good to reconnect. After that, I decided to take a walk—nothing too far, just around the block. The fresh air always helps, even if it’s chilly out. 
		In the afternoon, the sinus pressure came back a little. I think it’s the changing weather that messes with me sometimes. But I pushed through and wrapped up a couple of bigger tasks that have been hanging over me. I’m honestly starting to feel like I might be on the edge of being fully back to normal. 
		For dinner, I made something simple—pasta with a tomato sauce I threw together from scratch. It’s so easy, but it always feels like a win. The evening was spent winding down. Watched a couple of videos on YouTube and just chilled. 
		It feels like I’m turning a corner health-wise. I’m hoping tomorrow will be even better.

		---

		Day 3: Almost There
		I woke up feeling pretty close to normal today—just a little bit of a residual headache that faded quickly after I had some water. My sinuses are still a little off, but the pressure has decreased a lot. I think the worst of it is behind me now. It feels like the past couple of days of rest are paying off.
		I started the day with a workout—a light one, just some yoga to stretch out my body and get the blood flowing. I can tell I’ve been holding a lot of tension in my shoulders, so it felt good to work through that. I didn’t push myself too hard, but it was a nice way to ease into the day. 
		Work was productive again today. I finished a report I’ve been dragging my feet on, and honestly, it feels like such a relief to have that off my plate. My brain’s been firing on all cylinders again. I’m finally feeling like I’ve got my groove back. 
		For lunch, I went out to a little café I like. I’ve been staying in the past couple of days, so it was nice to get a change of scenery. I had a salad with grilled chicken, and it was fresh and simple. Afterward, I walked around the park for a bit. It wasn’t too crowded, so I could just enjoy the space and clear my mind. I think being outside has been the best thing for me this week.
		The evening was low-key. I made a quick stir-fry for dinner and spent some time reading a book I’ve been trying to finish. It’s funny how I didn’t really have the energy to read the past couple of days, but tonight it felt right.
		I’m feeling better—really close to being back to 100%. I think tomorrow I might get back into a bit more of a routine. Maybe even take on some more challenging tasks at work. But for now, I’m just happy to have gotten through the past few days without any major setbacks. Definitely looking forward to the weekend!
		""",


        # Input 1: 3-day journal
        """Day 1: Today, I woke up with a sore throat and a slight fever. My body feels achy, and I’ve been shivering on and off throughout the day.
        Day 2: Today, my throat still hurts, and my fever hasn’t gone down. I feel very tired and weak, and I’ve been coughing more than yesterday.
        Day 3: My fever is slightly better today, but I’m still coughing a lot. My throat feels less sore, but now I have a headache that won’t go away.""",

        # Input 2: 2-day journal
        """Day 1: I’ve had stomach pain all day and feel nauseous. I couldn’t eat much, and I’ve been feeling very bloated.
        Day 2: Today, the nausea is worse, and I vomited twice in the morning. My stomach still hurts, especially after eating.""",

        # Input 3: 5-day journal
        """Day 1: I woke up with a mild headache that lasted most of the day. Felt tired even after sleeping well.
        Day 2: The headache was worse today, and I felt dizzy when standing up. My appetite is lower than usual.
        Day 3: Today, the dizziness improved slightly, but the headache persists. I also feel some pressure behind my eyes.
        Day 4: The headache is still there but milder. However, now my neck feels stiff when I move it.
        Day 5: The headache is almost gone today, but my neck stiffness remains. I’m also feeling more tired than usual.""",

        # Input 4: Single-day journal
        "Day 1: Today, I’ve been coughing a lot, and my chest feels tight. My throat is also scratchy.",

        # Input 5: 4-day journal
        """Day 1: My nose has been stuffy all day, and I’ve been sneezing a lot. My eyes are watery too.
        Day 2: Today, my nose is still stuffy, but now my throat feels sore. Sneezing has decreased slightly.
        Day 3: The sore throat is worse today, and my voice sounds hoarse. I also feel more tired than usual.
        Day 4: My throat feels slightly better today, but my nose is still congested. Sneezing has stopped completely."""
    ]

    print(f"\nInput {3}:")
    print(inputs[3])
    print("\nGenerated Medical Report:")
    report = query_medical_ai(inputs[0])
    print(report)
