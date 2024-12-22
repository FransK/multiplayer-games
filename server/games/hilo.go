package games

import "log"

// HiLo is a Game.
// One player chooses an integer.
// The other player guesses until they guess the integer.
// Each guess they are told whether the correct answer is higher or lower.
type HiLo struct {
	magic_number int
}

// initialize a game of HiLo
func NewHilo() *HiLo {
	return &HiLo{magic_number: 10}
}

// methods required by main.Game
func (*HiLo) HandleMsg(usrid string, msg []byte) {
	log.Printf("HiLo received a message from %s: %v", usrid, msg)
}
