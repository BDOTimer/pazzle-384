#ifndef PROVIDE_RES_H
#define PROVIDE_RES_H
/// "provide_res.h"
///----------------------------------------------------------------------------|
/// ...
///----------------------------------------------------------------------------:
#include "myl.h"
#include "../bin/resEXE/allResIndex.h"


///----------------------------------------------------------------------------|
/// Итерфейс.
///----------------------------------------------------------------------- IRes:
struct       IRes
{            IRes(){}
    virtual ~IRes(){}

    virtual void get2LoadHere (sf::Image& obj) = 0;

protected:

};


///----------------------------------------------------------------------------|
/// ProvideResources
///----------------------------------------------------------- ProvideResources:
struct  ResourcesFromFiles : IRes
{       ResourcesFromFiles()
        {

        }

    void get2LoadHere (sf::Image& obj)
    {   std::cout << "run ResourcesFromFiles::get2LoadHere(.):\n";

    }

private:

};


///----------------------------------------------------------------------------|
/// ProvideResources
///----------------------------------------------------------- ProvideResources:
struct  ProvideResources
{       ProvideResources()
        {

        }



private:
    IRes* pRes{nullptr};

    TEST
    {   std::cout << "START ProvideResources::TEST():\n\n";

        sf::Image img;

        IRes* p{nullptr};

        ResourcesFromFiles resFiles;
        p               = &resFiles;

        p->get2LoadHere(img);

        std::cout << "FINISHED ProvideResources::TEST():\n\n";
    }
};

#endif // PROVIDE_RES_H
