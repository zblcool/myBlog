---
title: Unity & C# notes
date: 2020-09-22
tags:
  - Unity
  - C#
author: Ash
location: Wooli Creek, Sydeny  
---

> This is the note that stores my findings while doing the UTS FEIT31263 Game Development's assignment3

# C#

## Ways to Run a method later in sometime
 
### Invoke()
```cs
Invoke("dosomething",2);//this will happen after 2 seconds
```
### coroutines
```cs
 IEnumerator ExecuteAfterTime(float time)
 {
     yield return new WaitForSeconds(time);
 
     // Code to execute after the delay
 }

 StartCoroutine(ExecuteAfterTime(10));
//  OR

IEnumerator ExecuteAfterTime(float time, Action task)
 {
     if (isCoroutineExecuting)
         yield break;
     isCoroutineExecuting = true;
     yield return new WaitForSeconds(time);
     task();
     isCoroutineExecuting = false;
 }
 ```

## InvokeRepeating and cancle repeat

> If you wan to invoke a function/method after X seconds and repeat call it every Y seconds
### InvokeRepeating
```cs
InvokeRepeating("LaunchProjectile", 2, 0.3F);
// start in 2s. repeat every 0.3s
```
### Cancel repeat
```cs
CancelInvoke(); // this will cancle all the invokes in the enviroment.
```

## Audio Control

### sequence play
>play an audio file after another finishes
```cs
[RequireComponent(typeof(AudioSource))]
 public class LoopBGM : MonoBehaviour
 {
     public AudioClip StartClip;
     public AudioClip LoopClip;
 
     void Start()
     {
         StartCoroutine(playSound());
     }
 
     IEnumerator playSound()
     {
         GetComponent<AudioSource>().clip = StartClip;
         GetComponent<AudioSource>().Play();
         yield return new WaitForSeconds(StartClip.length);
         GetComponent<AudioSource>().clip = LoopClip;
         GetComponent<AudioSource>().Play();
         GetComponent<AudioSource>().loop = true;
     }
 }
```

## Modify a list while using it 
> Normally, you can not do this because the unity does not allow you to modify it while in a foreach loop. So, what we can do is:
- Use a for loop instead
- Create a separate collection of the items you want to act on, then iterate over that.

Second approach
```cs{7,12}
List<EduvisionUser> usersToRemove = new List<EduvisionUser>();
foreach (EduvisionUser aUser in users) --->***Exception thrown in this line***
{
    isUserAvailable = true;
    if(!aUser.Activated)
    {
        usersToRemove.Add(aUser);// Add to another list
    }
}
foreach (EduvisionUser userToRemove in usersToRemove)
{
    users.Remove(userToRemove);// delete the items in original list
}
```

# Unity
## trigger not working
>This might because you set the "has exit time" checkbox to be checked. If you want to use the trigger to start the transition, you need to cancel that box.

```csharp
    void SetTriggerToPacman()
    {
        //set a trigger for the state machine to change animation
        animator.SetTrigger("marked");
    }

    Invoke("SetTriggerToPacman", 1.5f);// Sometimes you need time for the transition. So you leave 1.5f here
```