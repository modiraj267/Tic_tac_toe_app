package com.tic_tac_toe_app

import android.media.AudioAttributes
import android.media.SoundPool
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class SoundModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var soundPool: SoundPool? = null
    private var swooshSoundId = 0
    private var dropSoundId = 0
    private var winSoundId = 0

    init {
        val audioAttributes = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_GAME)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()
        soundPool = SoundPool.Builder()
            .setMaxStreams(5)
            .setAudioAttributes(audioAttributes)
            .build()
        
        val ctx = reactContext.applicationContext
        val swooshResId = ctx.resources.getIdentifier("swoosh", "raw", ctx.packageName)
        val dropResId = ctx.resources.getIdentifier("drop", "raw", ctx.packageName)
        val winResId = ctx.resources.getIdentifier("win", "raw", ctx.packageName)
        
        if (swooshResId != 0) swooshSoundId = soundPool!!.load(ctx, swooshResId, 1)
        if (dropResId != 0) dropSoundId = soundPool!!.load(ctx, dropResId, 1)
        if (winResId != 0) winSoundId = soundPool!!.load(ctx, winResId, 1)
    }

    override fun getName(): String {
        return "SimpleSound"
    }

    @ReactMethod
    fun playSwoosh() {
        if (swooshSoundId != 0) {
            soundPool?.play(swooshSoundId, 1f, 1f, 0, 0, 1f)
        }
    }

    @ReactMethod
    fun playDrop() {
        if (dropSoundId != 0) {
            soundPool?.play(dropSoundId, 1f, 1f, 0, 0, 1f)
        }
    }

    @ReactMethod
    fun playWin() {
        if (winSoundId != 0) {
            soundPool?.play(winSoundId, 1f, 1f, 0, 0, 1f)
        }
    }
}
