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

# 1. CSharp
## 1.1. ClampMagnitude
```cs
public static Vector3 ClampMagnitude(Vector3 vector, float maxLength);
```
    Returns the copy of the Vector3 with its magnitude clamped to MaxLength
## 1.2. Properties in CSharp

> Lets look at the grammar first

```cs
class Person
{
    private string _name;  // the name field
    
    public string Name    // the Name property
    {
        get => _name;
        set => _name = value; // value is a placeholder
    }
    private static GameSpeed currentSpeedState = 1;
    public static GameSpeed CurrentSpeedState
    {
        get { return currentSpeedState; }
        set {
            currentSpeedState = value;
            speedModifier = (float)value;
        }
    }
    void updata()
    {
        Person.CurrentSpeedState = (SpeedManager.GameSpeed)PlayerPrefs.GetInt("currentSpeedState");// when you want to use it, just assign the value to it 
    }
}
```

- "value" in the Setter is just a placeholder like other parameters in a function 
- Properties is a constructor that have a getter and setter, you can set several things in setter.

## 1.3. Ways to Run a method later in sometime
 
### 1.3.1. Invoke()
```cs
Invoke("dosomething",2);//this will happen after 2 seconds
```
### 1.3.2. coroutines
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
## 1.4. Operators

### 1.4.1. Ternary Operator "?"

My example
``` cs{2}
void update(){
                SpeedManager.CurrentSpeedState =
                SpeedManager.CurrentSpeedState == SpeedManager.GameSpeed.Fast ?
                SpeedManager.GameSpeed.Slow :
                SpeedManager.GameSpeed.Fast ;
}
```
It looks like 
> condition ? statement 1 : statement 2

- the line I hightlighted is the start which is assign some value to CurrentSpeedState
- what I did follow is state a condition which is line 3 
- and line 4&5 is the statement 1&2 

## 1.5. InvokeRepeating and cancel repeat

> If you wan to invoke a function/method after X seconds and repeat call it every Y seconds
### 1.5.1. InvokeRepeating
```cs
InvokeRepeating("LaunchProjectile", 2, 0.3F);
// start in 2s. repeat every 0.3s
```
### 1.5.2. Cancel repeat
```cs
CancelInvoke(); // this will cancle all the invokes in the enviroment.
```

## 1.6. Audio Control

### 1.6.1. Check audio status
    AudioSource.isPlaying
```cs
public AudioClip otherClip;
AudioSource audioSource;
void Start()
{
    audioSource = GetComponent<AudioSource>();
}

void Update()
{
    if (!audioSource.isPlaying) // check status
    {
        audioSource.clip = otherClip;// change clips
        audioSource.Play();
    }
}
```
    
### 1.6.2. sequence play
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

## 1.7. Modify a list while using it 
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

# 2. Unity
## 2.1. trigger not working
>This might because you set the "has exit time" checkbox to be checked. If you want to use the trigger to start the transition, you need to cancel that box.

```csharp
    void SetTriggerToPacman()
    {
        //set a trigger for the state machine to change animation
        animator.SetTrigger("marked");
    }

    Invoke("SetTriggerToPacman", 1.5f);// Sometimes you need time for the transition. So you leave 1.5f here
```

## 2.2. Transform

### 2.2.1. Face the forward of a transform 

```cs
transform.forward
```

## 2.3. Scene manager
### 2.3.1. check if scene is loaded
```cs
SceneManager.GetActiveScene () == SceneManager.GetSceneByName ("scene1")
```
### 2.3.2. Load scene
```cs
LoadScene(int sceneBuildIndex, SceneManagement.LoadSceneMode mode = LoadSceneMode.Single)
LoadScene(string sceneName, SceneManagement.LoadSceneMode mode = LoadSceneMode.Single);
```
    load scene can load base on the name of the scene or the index of that scene

## 2.4. PlayerPrefs
### 2.4.1. Check if in the preferences have specific key
    PlayerPrefs.HasKey(string Key)

### 2.4.2. PlayerPrefs.SetInt
> set the value of the preference identiffied by key
```cs
    PlayerPrefs.SetInt(string key, int value);
```

## 2.5. Rigidbody
    Set the Constraints of this Rigidbody to freeze the x, y and z rotation. This will stop our character from falling / rolling over due to gravity and the

## 2.6. Transform
    Soem times the translate is werid. This is because the Transform.Translate() defaults to local space translation, which is affected by an object’s rotation.
    
    Set Transform.Translate() to use Space.World.