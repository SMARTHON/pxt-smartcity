input.onButtonPressed(Button.A, function () {
    SmartCity.control_traffic_light(
    true,
    true,
    true,
    AnalogPin.P3
    )
})
input.onButtonPressed(Button.B, function () {
    SmartCity.turn_servo(180, AnalogPin.P4)
    basic.pause(100)
    SmartCity.turn_servo(0, AnalogPin.P4)
})
OLED.init(128, 64)
led.enable(false)
basic.forever(function () {
    OLED.clear()
    OLED.writeStringNewLine("Light:" + SmartCity.read_light_sensor(AnalogPin.P0))
    OLED.writeStringNewLine("Motion:" + SmartCity.read_motion_sensor(AnalogPin.P1))
    OLED.writeStringNewLine("dis:" + SmartCity.read_distance_sensor(SmartCity.DistanceUnit.Centimeters, DigitalPin.P14, DigitalPin.P15))
    OLED.writeStringNewLine("temp:" + SmartCity.readData(SmartCity.DHT11dataType.temperature, DigitalPin.P2))
})
