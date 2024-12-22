package main

// A game needs to:
// 1. receive messages from users
// 2. decide what to do with those messages
// 3. +/- maintain internal state
// 4. inform users of the current state
type Game interface {
	HandleMsg(usrid string, msg []byte)
}
