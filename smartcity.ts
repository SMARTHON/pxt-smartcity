namespace SmartCity {
    export enum On_Off {
        //% block="off"
        off = 0,
        //% block="on"
        on =1
    }
	
	

	export enum DHT11dataType {
    //% block="humidity"
    humidity,
    //% block="temperature"
    temperature,
	}
	
	export enum DistanceUnit {
    //% block="μs"
    MicroSeconds,
    //% block="cm"
    Centimeters,
    //% block="inches"
    Inches
	}
	
    

    let temp = 0
	let temp_pin=0
	let _temperature: number = -999.0
    let _humidity: number = -999.0
    let _readSuccessful: boolean = false
	

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
    //% block="Get noise level (dB) at Pin %sound_pin"
    //% weight=170
	//% blockGap=7
    export function read_sound_sensor(sound_pin: AnalogPin): number {
        temp_pin = parseInt(sound_pin.toString())
		temp = pins.map(Math.abs(pins.analogReadPin(temp_pin) - 512),0,512,0,1023);
		temp =temp/1023*100
        return temp
    }
	
    //% block="Get DHT11 at pin %dataPin|"
    function dht11_queryData( dataPin: DigitalPin) {

        //initialize
        let startTime: number = 0
        let endTime: number = 0
        let checksum: number = 0
        let checksumTmp: number = 0
        let dataArray: boolean[] = []
        let resultArray: number[] = []
        for (let index = 0; index < 40; index++) dataArray.push(false)
        for (let index = 0; index < 5; index++) resultArray.push(0)
        _humidity = -999.0
        _temperature = -999.0
        _readSuccessful = false

        startTime = input.runningTimeMicros()

        //request data
        pins.digitalWritePin(dataPin, 0) //begin protocol
        basic.pause(18)
        //if (pullUp) pins.setPull(dataPin, PinPullMode.PullUp) //pull up data pin if needed
        pins.digitalReadPin(dataPin)
        control.waitMicros(20)
        while (pins.digitalReadPin(dataPin) == 1);
        while (pins.digitalReadPin(dataPin) == 0); //sensor response
        while (pins.digitalReadPin(dataPin) == 1); //sensor response

        //read data (5 bytes)
        for (let index = 0; index < 40; index++) {
            while (pins.digitalReadPin(dataPin) == 1);
            while (pins.digitalReadPin(dataPin) == 0);
            control.waitMicros(28)
            //if sensor pull up data pin for more than 28 us it means 1, otherwise 0
            if (pins.digitalReadPin(dataPin) == 1) dataArray[index] = true
        }

        endTime = input.runningTimeMicros()

        //convert byte number array to integer
        for (let index = 0; index < 5; index++)
            for (let index2 = 0; index2 < 8; index2++)
                if (dataArray[8 * index + index2]) resultArray[index] += 2 ** (7 - index2)

        //verify checksum
        checksumTmp = resultArray[0] + resultArray[1] + resultArray[2] + resultArray[3]
        checksum = resultArray[4]
        if (checksumTmp >= 512) checksumTmp -= 512
        if (checksumTmp >= 256) checksumTmp -= 256
        if (checksum == checksumTmp) _readSuccessful = true

        //read data if checksum ok
        if (_readSuccessful) {
            
                //DHT11
                _humidity = resultArray[0] + resultArray[1] / 100
                _temperature = resultArray[2] + resultArray[3] / 100
            
        }

        //wait 2 sec after query 
        basic.pause(2000)

    }

    //% block="DHT11 Read %dht11data| at pin %dht11pin|"
	//% weight=150
	//% blockGap=7
    export function readData(dht11data: DHT11dataType, dht11pin: DigitalPin): number {
		// querydata
		dht11_queryData(dht11pin)
		//return temperature /humidity
		if(dht11data == DHT11dataType.temperature && _readSuccessful)
			return Math.round (_temperature)
		else if(dht11data == DHT11dataType.humidity && _readSuccessful)
			return Math.round (_humidity)
		else return 0
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

