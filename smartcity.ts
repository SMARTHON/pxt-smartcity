namespace SmartCity {
    export enum On_Off {
        //% block="off"
        off = 0,
        //% block="on"
        on =1
    }
	
	
	export enum DistanceUnit {
    //% block="μs"
    MicroSeconds,
    //% block="cm"
    Centimeters,
    //% block="inches"
    Inches
	}
	
	 export enum DHT11_Unit {
        //% block="temperature(C)"
        DHT11_temperature_C=0,

        //% block="temperature(F)"
        DHT11_temperature_F=1,

        //% block="humidity(0~100)"
        DHT11_humidity=2,
    }

    let temp = 0
	let temp_pin=0


    //% blockId=control_traffic_light
    //% block="Control traffic light at Pin %traffic_pin|Red %out_red|Yellow %out_yellow|Green %out_green"
    //% weight=250
    export function control_traffic_light(traffic_pin: AnalogPin, out_red: On_Off, out_yellow: On_Off, out_green: On_Off): void {
        temp =  2*2*out_red + 2*out_yellow + out_green
        temp = temp*125
        pins.analogWritePin(traffic_pin, temp)
		basic.pause(500)
    }
	
	//% blockId=read_light_sensor
    //% block="Get light value (percentage) at Pin %light_pin"
    //% weight=225
	//% blockGap=7
    export function read_light_sensor(light_pin: AnalogPin): number {
        temp_pin = parseInt(light_pin.toString())
		temp = Math.round(100 - pins.analogReadPin(temp_pin)/1023*100)
        return temp
    }

	//% blockId=read_raindrop_sensor
    //% block="Get raindrop value (percentage) at Pin %rain_pin"
    //% weight=200
	//% blockGap=7
    export function read_raindrop_sensor(rain_pin: AnalogPin): number {
        temp_pin = parseInt(rain_pin.toString())
		temp = Math.round(pins.analogReadPin(temp_pin)/1023*100)
        return temp
    }

	//% blockId=read_motion_sensor
    //% block="Get motion (triggered or not) at Pin %motion_pin"
    //% weight=180
	//% blockGap=7
    export function read_motion_sensor(motion_pin: AnalogPin): boolean {
        temp_pin = parseInt(motion_pin.toString())
		temp = pins.analogReadPin(temp_pin)
		if (temp > 800)
			return true
		else return false
    }
	
	//% blockId=read_sound_sensors
    //% block="Get noice level (dB) at Pin %sound_pin"
    //% weight=170
	//% blockGap=7
    export function read_sound_sensor(sound_pin: AnalogPin): number {
        temp_pin = parseInt(sound_pin.toString())
		temp = pins.map(Math.abs(pins.analogReadPin(temp_pin) - 512),0,512,0,1023);
		temp =temp/1023*100
        return temp
    }
	
	//% blockId="read_dht11_sensor"
    //% block="Get DHT11 %dht11unit| at pin %dht11pin"
	//% weight=150
	//% blockGap=7
    export function dht11value(dht11unit: DHT11_Unit, dht11pin: DigitalPin): number {

        pins.digitalWritePin(dht11pin, 0)
        basic.pause(18)
        let i = pins.digitalReadPin(dht11pin)
        pins.setPull(dht11pin, PinPullMode.PullUp);
        switch (dht11unit) {
            case 0:
                let dhtvalue0 = 0;
                let dhtcounter0 = 0;
                while (pins.digitalReadPin(dht11pin) == 1);
                while (pins.digitalReadPin(dht11pin) == 0);
                while (pins.digitalReadPin(dht11pin) == 1);
                for (let i = 0; i <= 32 - 1; i++) {
                    while (pins.digitalReadPin(dht11pin) == 0);
                    dhtcounter0 = 0
                    while (pins.digitalReadPin(dht11pin) == 1) {
                        dhtcounter0 += 1;
                    }
                    if (i > 15) {
                        if (dhtcounter0 > 2) {
                            dhtvalue0 = dhtvalue0 + (1 << (31 - i));
                        }
                    }
                }
                return ((dhtvalue0 & 0x0000ff00) >> 8);
                break;
            case 1:
                while (pins.digitalReadPin(dht11pin) == 1);
                while (pins.digitalReadPin(dht11pin) == 0);
                while (pins.digitalReadPin(dht11pin) == 1);
                let dhtvalue1 = 0;
                let dhtcounter1 = 0;
                for (let i = 0; i <= 32 - 1; i++) {
                    while (pins.digitalReadPin(dht11pin) == 0);
                    dhtcounter1 = 0
                    while (pins.digitalReadPin(dht11pin) == 1) {
                        dhtcounter1 += 1;
                    }
                    if (i > 15) {
                        if (dhtcounter1 > 2) {
                            dhtvalue1 = dhtvalue1 + (1 << (31 - i));
                        }
                    }
                }
                return Math.round((((dhtvalue1 & 0x0000ff00) >> 8) * 9 / 5) + 32);
                break;
            case 2:
                while (pins.digitalReadPin(dht11pin) == 1);
                while (pins.digitalReadPin(dht11pin) == 0);
                while (pins.digitalReadPin(dht11pin) == 1);

                let value2 = 0;
                let counter2 = 0;

                for (let i = 0; i <= 8 - 1; i++) {
                    while (pins.digitalReadPin(dht11pin) == 0);
                    counter2 = 0
                    while (pins.digitalReadPin(dht11pin) == 1) {
                        counter2 += 1;
                    }
                    if (counter2 > 3) {
                        value2= value2 + (1 << (7 - i));
                    }
                }
                return value2;
            default:
                return 0;
        }
    }
	 
	//% blockId=read_distance_sensor
	//% block="Get distance unit %unit|trig %trig|echo %echo"
	//% weight=140
    export function read_distance_sensor(unit: DistanceUnit, trig: DigitalPin, echo: DigitalPin, maxCmDistance = 500): number {
        // send pulse
        pins.setPull(trig, PinPullMode.PullNone);
        pins.digitalWritePin(trig, 0);
        control.waitMicros(2);
        pins.digitalWritePin(trig, 1);
        control.waitMicros(10);
        pins.digitalWritePin(trig, 0);

        // read pulse
        const d = pins.pulseIn(echo, PulseValue.High, maxCmDistance * 58);

        switch (unit) {
            case DistanceUnit.Centimeters: return Math.idiv(d, 58);
            case DistanceUnit.Inches: return Math.idiv(d, 148);
            default: return d ;
        }
    }
	

    
	
	
	//% blockId=read_sensors
    //% block="Get general sensor analog value at Pin %gen_pin"
    //% weight=130
    export function read_sensor(gen_pin: AnalogPin): number {
        temp_pin = parseInt(gen_pin.toString())
		temp = Math.round(pins.analogReadPin(temp_pin))
        return temp
    }
	
}

