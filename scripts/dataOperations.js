	function getTotals(deathCause)
    {
        var list = deaths;
        var years = {}
        
        for(var i in list)
        {
            if(list[i].Cause !== deathCause || list[i].Code === "0" )
                continue;

            var obj = {};
            if( years[list[i].Year] === undefined )
                obj.DeathCount = 0;
            else
                obj = years[list[i].Year];

            obj.DeathCount = Number(obj.DeathCount) + Number(list[i].DeathCount);
            obj.Year = list[i].Year;
            obj.DeathCause = deathCause;
            years[list[i].Year] = obj;
        }

        var results = [];
        for(var i = 2005; i <= 2015; i++)
        {
            results.push(years[i]);
        }

        return results;
    }

    function getPopulation(code, year, locality)
    {
        var list = populations;
        var result = 0;
        //{"Code":"AK","Year":"2005","Pop":"663333","Locality":"All"}
        for(var i in list)
        {
            if(list[i].Pop == ".")
                continue;
            
            if( (list[i].Year == year && list[i].Code === code) || (list[i].Year == year && code == "0" ))
                result = result + Number(list[i].Pop);
        }
        
        return result;
    }

    function compareDeathObj(obj, deathCause, year)
    {
        if(deathCause !== "All" && year != "0")
            return obj.Year == year && obj.Cause === deathCause && obj.Code !== "0";
        else
            if(deathCause === "All" && year != "0")
                return obj.Year == year && obj.Code !== "0";
        else
             if(deathCause !== "All" && year == "0")
                return obj.Cause === deathCause && obj.Code !== "0";
            else
                return obj.Code !== "0";
    }

    function getStatesObject()
    {
        var statesHash = {};
        for(var i in states)
        {
            statesHash[states[i].Code] = states[i].Name;
        }
        
        return statesHash; 
    }

    function getCauseDeathCounts(deathCause, year)
    {
        var statesHash = getStatesObject();
        var list = deaths;
        var results = [];
        for(var i in list)
        {
            if(compareDeathObj(list[i], deathCause, year) )
            {
                var temp = {};
                temp.Code = list[i].Code;
                temp.State = statesHash[temp.Code];
                temp.DeathCount = Number(list[i].DeathCount);
                temp.Cause = list[i].Cause;
                temp.Year = list[i].Year;
                temp.Locality = list[i].Locality;
                results.push(temp);
            }
        }
        
         var results2 = d3.nest()
          .key(function(d) { return d.Code; })
          .rollup(function(v) { return d3.sum(v, function(d) { return d.DeathCount; }); })
          .entries(results);
        
        
        for(var j in results2)
        {
            results2[j].Year = year;
            results2[j].State = statesHash[results2[j].key];
            results2[j].DeathCount = results2[j].values;
            results2[j].Code = results2[j].key;
            results2[j].Cause = deathCause;
        }
        
        return results2;
    }

    function getCauseStateDeathCounts(deathCause, year, state)
    {
        var list = deaths;
        var results = [];
        for(var i in list)
        {
            var obj = list[i];
            if((obj.Year == year && obj.Cause === deathCause && obj.Code === state) || (year == "0" && obj.Cause === deathCause && obj.Code === state))
            {
                var temp = {};
                temp.Code = list[i].Code;
                temp.DeathCount = Number(list[i].DeathCount);
                temp.Cause = list[i].Cause;
                temp.Year = list[i].Year;
                temp.Locality = list[i].Locality;
                results.push(temp);
            }
        }
        
        return results;
    }
