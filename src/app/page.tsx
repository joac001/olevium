'use client';
import Typography from "@/components/shared/ui/text/Typography";
import Box from "@/components/shared/ui/content/Box";
import Container from "@/components/shared/ui/content/Container";
import Card from "@/components/shared/ui/content/Card";
import { ActionButtonProps } from "@/components/shared/ui/buttons/ActionButton";
import Button from "@/components/shared/ui/buttons/Button";
import Banner from "@/components/shared/ui/content/Banner";
import { DropMenuOption } from "@/components/shared/ui/inputs/DropMenu";
import Link from "@/components/shared/ui/text/Link";
import Tooltip from "@/components/shared/ui/text/Tooltip";
import ClientForm from "./_homeComponents/ClientForm";
import { useModal } from "@/context/ModalContext";
import { useNotification } from "@/context/NotificationContext";
import Chip from "@/components/shared/ui/content/Chip";

export default function Home() {

    const { showModal } = useModal();
    const { showNotification } = useNotification();

    const abA: ActionButtonProps[] = [
        { icon: 'fas fa-plus', color: 'success', text: 'Agregar' } as ActionButtonProps,
        { icon: 'fas fa-download', color: 'accent', text: 'Descargar' } as ActionButtonProps
    ]

    const abB: ActionButtonProps[] = [
        { icon: 'fas fa-ban', color: 'danger', text: 'Eliminar' } as ActionButtonProps,
    ]

    const abC: ActionButtonProps[] = [
        { icon: 'fas fa-plus', color: 'info', text: 'Agregar' } as ActionButtonProps,
        { icon: 'fas fa-warning', color: 'warning', text: 'Denunciar' } as ActionButtonProps,
        { icon: 'fas fa-download', color: 'accent', text: 'Descargar' } as ActionButtonProps
    ]

    const options: DropMenuOption[] = [
        { value: 'Item 1' } as DropMenuOption,
        { value: 'Item 2' } as DropMenuOption,
        { value: 'Una opcion muy larga para ver que funcione bien el wrap.......' } as DropMenuOption,
    ]

    const ModalContent = () => {
        return (
            <>
                <Typography variant="h2">Este es el contenido del modal</Typography>
                <Typography variant="body">Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus architecto non, nemo quisquam esse quae. Ex molestias nesciunt, maxime unde atque molestiae delectus ipsam sed officiis aspernatur, rem sunt iusto!
                    Incidunt sit provident perferendis? Autem animi blanditiis eos quasi atque corrupti suscipit soluta quas. Sequi autem, at ab ratione ullam facilis incidunt placeat, itaque quas totam non repudiandae! Neque, fugit.
                    Dignissimos eum praesentium nam. Repudiandae, ab quo iusto, hic velit, animi ipsam provident eveniet sed cupiditate praesentium. Labore repellendus, minus in tempora ex ab aliquam assumenda dignissimos sit eos laudantium.
                    Fugit omnis quisquam accusamus perferendis repellat necessitatibus, adipisci aliquam nemo quae aut delectus mollitia cumque a culpa assumenda quis eum illum? Omnis accusamus porro aperiam sint quas quibusdam blanditiis a.
                    Itaque officia expedita perferendis est optio, dicta unde, reiciendis ipsa sapiente suscipit, laudantium numquam placeat sint. Quos quia exercitationem quas odit, facere excepturi animi voluptas iure quo hic quam quasi.
                    Ratione cupiditate voluptates consequuntur a autem ea! Est adipisci quibusdam vitae inventore voluptate esse quisquam earum nobis dolor delectus quo at soluta ratione ipsum, consequuntur itaque beatae excepturi iusto cupiditate.
                    Explicabo architecto laudantium voluptates quo blanditiis id sequi asperiores placeat enim, iste magni unde aliquam eos at quam veniam, sed quasi quod amet temporibus consequuntur! Optio eius a laudantium accusamus.
                    Eligendi, corrupti! Deserunt numquam, laborum recusandae voluptatem culpa aperiam. Repudiandae aut provident incidunt nobis, asperiores, sint, totam iste voluptatibus dignissimos commodi laborum quidem quia veritatis maiores adipisci omnis corporis inventore.
                    Nihil ea sequi voluptate amet provident nisi, consequuntur reprehenderit, accusamus omnis repudiandae, molestias ad voluptas consectetur. Voluptatem modi error possimus laborum repudiandae ipsum voluptatum consectetur ducimus dicta. Laboriosam, beatae optio.
                    Nihil ab similique nesciunt, labore perspiciatis quidem excepturi laboriosam impedit, velit, aperiam qui praesentium iusto ratione voluptates eos vel eum. Corporis dolor architecto ipsam laboriosam quae provident quaerat error quidem!
                    Molestias vitae itaque expedita sequi maiores omnis delectus assumenda voluptates, unde et aperiam enim nobis error ipsa, voluptatum reiciendis. Voluptates laudantium deserunt eius aperiam modi accusantium molestias sunt aut ducimus?
                    Quis voluptates doloremque eveniet molestias delectus iusto assumenda officia rem, quo, illo nulla dicta! Veniam eveniet reprehenderit dolore repudiandae doloremque consequuntur, et praesentium. Culpa non voluptate ipsum, fuga similique enim.
                    Itaque obcaecati quia, quis beatae non commodi molestiae deserunt ipsum eaque nisi laudantium perspiciatis sequi quaerat voluptatum minus doloremque rerum omnis sit. Quo quis id aut quod nisi dolorem laborum?
                    Qui neque eaque vel tempore consequuntur quidem doloremque commodi molestias dolores. Soluta magni, officiis voluptatem, inventore deserunt perspiciatis animi autem molestias, ipsa labore saepe asperiores aspernatur hic distinctio consequuntur illum!
                    Labore quidem facilis obcaecati veniam laudantium voluptatem. Sint sapiente unde harum quam labore ab id repudiandae minima distinctio voluptatum hic vel ratione, adipisci sequi ducimus atque. Suscipit nam tenetur modi.
                    Praesentium veritatis quae id aspernatur obcaecati facere expedita enim ullam temporibus, debitis nisi doloribus! Porro officia et vel. Ipsum tempora dignissimos sit recusandae, autem neque dicta quibusdam aut quam magni!
                    Aliquid aspernatur, fuga quaerat, ducimus cumque minima natus nihil sunt iusto delectus, voluptates praesentium optio? Nam molestiae aut ratione eos magnam consequuntur debitis beatae illum, inventore veritatis! Laborum, rerum magnam!
                    Quas placeat explicabo non neque eos dolor ullam modi alias reiciendis ea optio consequatur dolore impedit sint maiores vitae assumenda voluptate repellat, molestiae consequuntur nulla labore voluptas repudiandae reprehenderit. Maxime!
                    Magnam, voluptates! Corporis quod eveniet provident laboriosam at a dolorum voluptatem nihil aliquam. Natus nostrum consectetur est porro ea in explicabo aperiam minus. Laboriosam in, quis aliquam nulla nam asperiores.
                    Quam ducimus necessitatibus impedit pariatur voluptatibus. Soluta minus repellat, praesentium similique mollitia delectus provident iste autem cupiditate impedit unde illum amet architecto, molestiae sequi velit esse in est dolor distinctio.
                    Aut, magnam voluptatibus! Aliquam magni vitae tenetur amet, omnis modi provident quidem odio quod, earum atque explicabo. Architecto atque tenetur iusto necessitatibus fugiat autem. Natus, aliquam quasi. Ipsam, hic quidem.
                    Aut est nesciunt officiis, perferendis consequuntur eius quo quasi beatae repellendus. Aut nisi neque, aliquid reiciendis odio laborum minima, iusto harum voluptatum dolores reprehenderit vero. Unde dolor at illo asperiores.
                    Nihil consectetur eum veniam quae id, dolore et impedit, ipsam nesciunt perferendis ea dolorum inventore doloremque sit explicabo iste, porro illo hic. Ducimus autem veniam neque accusamus est sit dolorum.
                    Aliquid dolor reiciendis expedita ratione mollitia atque quod, inventore rerum vitae, impedit perferendis provident, earum minima eius nam architecto sint dicta soluta? Fuga laboriosam itaque fugit voluptate rem suscipit id.
                    Explicabo necessitatibus recusandae nisi minus dicta aperiam delectus voluptate ipsum, distinctio corporis voluptates adipisci, placeat nulla dignissimos impedit repudiandae harum sit, cumque veritatis architecto consectetur! Modi ratione necessitatibus accusantium temporibus.
                    Nobis ratione velit facilis dignissimos sequi soluta inventore nostrum magnam, rem qui quasi quaerat nisi beatae, cum veritatis impedit minus illum, praesentium atque optio porro. Exercitationem, maxime. Ipsa, quidem mollitia.
                    Cupiditate earum libero nisi ipsa consequuntur dolores labore molestiae modi. Inventore voluptas sequi necessitatibus in nisi illum assumenda aut voluptatum aliquam? Facilis quia quo, voluptate nostrum vel deserunt excepturi odio!
                    Facere quisquam nam quas deleniti molestias maiores eligendi, vitae vero unde, odit natus. Officia, dolores cum aspernatur accusantium quos quaerat itaque consequuntur repellendus suscipit sapiente odio distinctio eum, incidunt adipisci.
                    Delectus alias blanditiis velit, dolores quaerat reiciendis! Unde sint ab sed ex ducimus, optio incidunt in quisquam autem illum tempora perspiciatis quidem nisi, accusantium ut rerum a, beatae aperiam totam.
                    Qui molestias assumenda ut autem saepe molestiae rerum excepturi, soluta corporis ab! Molestias harum enim reprehenderit? Soluta, est! Libero reprehenderit odio ipsa dignissimos tenetur earum corporis amet harum assumenda aliquam?
                    Illo magni vero repellat dolorem repellendus fuga quisquam nostrum, eligendi praesentium velit incidunt cumque expedita, recusandae voluptatem commodi odit maxime? Magnam voluptatibus neque rem saepe deserunt eius totam, sed nam.
                    Vero neque cumque optio ut eveniet provident minima ullam. Porro earum consectetur neque, officia inventore dignissimos quaerat. Quis eos cupiditate architecto tempora nemo numquam perferendis, soluta, a illo error itaque?
                    Aliquam sunt magni itaque nesciunt culpa perspiciatis aspernatur voluptatum at impedit quos ullam harum, pariatur recusandae fuga sed quas, ut maxime maiores. Sed at odio maiores dolorum possimus id voluptas!
                    Aperiam sed placeat ipsum, obcaecati dolores ducimus eveniet dignissimos soluta expedita sit consequuntur corrupti sunt dolore. At qui tempore error accusamus pariatur, expedita incidunt! Voluptatem ut dolore perspiciatis soluta ab?
                    Cumque, nostrum! Assumenda sapiente inventore perferendis amet exercitationem fuga consequuntur suscipit doloribus, optio est, distinctio repellat quo ratione eos impedit tempora? Esse sint harum voluptatem quia voluptate iusto accusamus unde.
                    Ipsa, numquam libero laborum, eum optio blanditiis iure, facere aperiam eaque tempora quo dolore suscipit? Porro nemo autem mollitia debitis rerum asperiores adipisci aut fuga voluptates harum sequi, obcaecati illum?
                    Hic autem commodi doloremque consequatur similique ea esse soluta numquam facere debitis, adipisci reiciendis natus sed dicta perspiciatis, tempora molestias, vitae corrupti harum! Odio at molestias debitis quisquam commodi excepturi.
                    Consequatur numquam aperiam incidunt officiis fugit, inventore aut nisi facere totam perspiciatis, maxime, quos nostrum vitae earum. Esse repellat, illo iusto quod cumque veniam, sint cum quisquam, in illum voluptate!
                    Nam non, suscipit provident repellendus debitis dolor unde error, maiores et, architecto dolores blanditiis. Eum a totam, natus reprehenderit pariatur commodi, harum at sit asperiores voluptas facilis est soluta libero.
                    Aliquid similique earum cumque, quidem fugiat culpa atque explicabo odit molestias reprehenderit error dignissimos unde molestiae veniam corporis impedit provident odio libero officiis consequuntur eaque ducimus illo aspernatur! Possimus, quos.
                    Fugit modi voluptatibus corporis recusandae doloribus commodi consectetur hic asperiores laboriosam ab quas possimus nisi eligendi dicta quidem error vero officia corrupti dolor, magnam molestias expedita esse dolore ducimus! Quod.
                    Unde dolores repellat ipsam molestiae iure aspernatur facere voluptatibus incidunt debitis, quas eum voluptatem est fugit magni in itaque repudiandae sint accusantium inventore sed tenetur deleniti provident amet? Esse, dolorem!
                    Numquam blanditiis quo at ut enim adipisci iste omnis aliquid dolores, quia neque tempora reiciendis nobis quaerat consequuntur porro, nisi perferendis dolorum! Officiis sed hic mollitia aut alias, culpa repellendus.
                    Fuga repudiandae et nam eaque earum cupiditate dolorem, nobis rem corporis id inventore ex, mollitia doloribus voluptate magni accusantium iure. Incidunt sed labore totam, omnis tempore maiores est nesciunt rerum?
                    Facilis tempora ex nisi sit commodi. Voluptas iure porro ea veritatis minima? Deleniti a laborum excepturi quia recusandae enim consequuntur, nisi hic fugit sequi eveniet corrupti officiis cum provident quod!
                    Architecto, ullam earum! Soluta dicta saepe dolorem itaque quasi magnam quae culpa officiis, obcaecati libero nostrum ducimus fugiat consequuntur distinctio iste tempore, modi ab vero. Explicabo cupiditate vel qui ut.
                    Ut cupiditate soluta dolores quod necessitatibus consectetur aspernatur sapiente molestias eius a, magnam culpa rem rerum dolorum eos voluptate deleniti. Voluptates corporis facere doloribus praesentium repudiandae assumenda unde rerum veritatis.
                    Eos facilis architecto saepe numquam nihil ea suscipit officiis maxime quibusdam eum ipsam pariatur ex laudantium harum ipsum eaque quia, nemo vitae esse perspiciatis dicta sint ullam. Odio, est corporis?
                    Temporibus, vitae fugiat ad beatae debitis quisquam quod quam nam quidem tempore quas eius iure labore nemo. Tenetur sint architecto obcaecati inventore ipsa molestiae neque sit molestias vero, natus culpa!
                    Ipsam consequuntur dolores quia debitis, perferendis eos necessitatibus saepe cumque sapiente ex. Quidem libero tempora pariatur? Temporibus dolorum ratione labore vitae, blanditiis animi tenetur optio maxime, eius consectetur, qui eligendi?
                    Necessitatibus reiciendis voluptatibus laboriosam perspiciatis voluptatum, harum dolorem. Quas praesentium ad excepturi earum temporibus, veritatis doloribus officiis laudantium laboriosam, ex sapiente dolorem quod quidem modi vero veniam corrupti quo! Corporis.
                    Qui, eum voluptate ab molestiae, nihil neque architecto unde atque veritatis quisquam nisi? Hic accusantium suscipit in, rerum placeat labore quis et praesentium ullam optio consectetur illum provident dolores vitae.
                    Recusandae repudiandae necessitatibus praesentium tenetur, incidunt unde, commodi impedit illo sequi eum dolore consequatur maiores, possimus fugit ducimus ipsam aut sunt et facilis sapiente hic deserunt aliquam! Ipsum, tempore natus!
                    Modi ad dolorem corporis magni. Commodi explicabo aperiam mollitia fugiat illum, natus facere, corrupti velit vel officiis nostrum blanditiis doloremque nulla facilis eveniet architecto, deleniti quod voluptas culpa! Debitis, dolorem.
                    Exercitationem, quasi porro quam possimus ex, velit, pariatur dolores quia perferendis nemo modi sit. Veniam distinctio, porro ullam cum rem impedit esse nihil fugiat ducimus nulla magni labore corporis vel.
                    Aliquam magni maxime minima libero laborum quod ratione vero nisi ipsum autem nostrum quasi aliquid, et accusantium rerum, eveniet eius voluptatem velit? Reiciendis porro aperiam at, repellat commodi debitis magni.
                    Illum optio repellat perferendis eligendi voluptatibus iure nostrum illo mollitia? Sit nam inventore officia expedita harum fuga recusandae distinctio unde? Porro vero ullam, praesentium eveniet inventore et consectetur recusandae doloribus.
                    Hic enim cum provident magnam ullam aliquid a mollitia fugit voluptas non beatae recusandae ex qui, dolorum voluptatibus nobis necessitatibus veniam temporibus odio? Rerum tenetur velit dolore, sequi quaerat deleniti?
                    Asperiores ad doloremque culpa dolorum delectus cumque reiciendis eligendi vitae voluptas error aut beatae omnis ducimus nisi minus aliquid consequatur autem perferendis amet nemo nobis, eius architecto laborum exercitationem? Cumque!
                    Atque neque veniam tempore quae ipsa optio magnam fuga accusantium exercitationem fugiat facilis autem, inventore placeat perferendis necessitatibus? Aspernatur ab dicta doloremque minima delectus quas aut culpa repudiandae vitae possimus.
                    Dolore iusto nihil facilis quibusdam temporibus, error expedita accusantium nostrum dolorem voluptas optio magnam debitis nesciunt blanditiis deleniti minus distinctio placeat voluptatum corrupti perferendis nam natus ex. Inventore, porro soluta!
                    Perferendis soluta ea perspiciatis, hic rem facere modi sed porro itaque quaerat molestiae obcaecati necessitatibus a? Voluptatem quia autem eius id iure tenetur assumenda libero. Atque, corporis sapiente. Dolores, nostrum.
                    Nisi velit minima soluta debitis nostrum adipisci accusamus, facilis expedita officiis necessitatibus doloremque dolor quisquam ab eum maiores ullam enim, iste, aperiam cumque sit odit tempore. Sunt atque excepturi explicabo.
                    Maiores aliquam ducimus odit tempore repudiandae, vero fuga ipsum beatae! Ad reiciendis dolore repellendus ipsam. Earum temporibus veritatis distinctio aut pariatur beatae quidem minus, illo voluptate a ducimus rem non?
                    Minus porro, modi quasi atque aperiam tempora maxime nulla quibusdam explicabo impedit laudantium voluptate quaerat cum ex, eos illo facere totam sit veritatis, sunt distinctio cupiditate! Officia ipsa repellat quaerat?
                    Dolorum quia perferendis pariatur dolorem perspiciatis quis nobis minima ipsa labore officia quas tenetur exercitationem ab quo repellat, voluptas aperiam odit earum odio quibusdam provident illum aut aliquam! Adipisci, doloremque?
                    Quam labore asperiores error, laboriosam officia quisquam optio numquam ullam dolorum! Eos consequatur ea sint et dolorum id pariatur accusamus aut dolores distinctio, numquam debitis ipsa quas repellat, accusantium perferendis!
                    Deleniti fugit molestias beatae explicabo rem! Placeat aspernatur at repellat voluptatibus qui cumque dolores, ipsa itaque nulla laboriosam voluptas illum autem facere quasi eius iusto corporis temporibus esse sunt? Officia.
                    Recusandae aut sequi dicta necessitatibus porro quas architecto ipsam, adipisci facere laboriosam. Deserunt aliquid rerum libero sint maiores odio, eos, amet ipsa explicabo nisi autem accusantium quasi laudantium esse nihil.
                    Vitae possimus error delectus, inventore recusandae natus quaerat minima numquam sunt distinctio, commodi architecto unde facilis illum fugiat provident eius, tempora atque optio temporibus dolore perferendis exercitationem. Dolore, deleniti labore.
                    Quos incidunt commodi harum quae. Officia praesentium consequatur iure numquam voluptate qui nesciunt temporibus exercitationem? Eius animi unde dolorem doloremque, debitis perferendis accusamus quae voluptates necessitatibus nobis nihil similique rerum!
                    Culpa cum voluptas optio exercitationem aperiam officiis ipsa ex illum. Totam quibusdam quaerat dolorem ex, eum voluptatibus nesciunt! Illum minima qui labore quos? Maxime molestias consequuntur a exercitationem quibusdam illum?
                    Distinctio, porro facere incidunt fugiat quam nihil repudiandae magnam quo eius aliquam! Dolore, fugiat recusandae assumenda dicta nisi officia tempore consequatur ab eum quibusdam laudantium minima quasi at asperiores deleniti.
                    Ab facere quos nobis vel molestias excepturi. Nihil unde corporis minima, explicabo est omnis illo, alias nostrum error sapiente voluptatum qui dolores commodi sequi, deserunt impedit consectetur. Nostrum, dicta voluptatem.
                    Est nihil dolore perferendis voluptate maiores? Ipsum iure repudiandae, magnam laboriosam illo quos nemo inventore voluptate animi itaque laborum illum, provident reiciendis quo possimus corporis voluptatum! Consectetur totam deserunt modi!
                    Quas quia aliquid explicabo corporis odio doloribus laudantium porro deleniti dolore ipsum, cupiditate assumenda voluptatem ullam eveniet, tempore, ipsam et corrupti illum tempora! Minima asperiores ipsam voluptate, fuga a nihil.
                    Voluptate sint numquam neque corrupti veritatis vel soluta recusandae? Quo, hic rerum quasi ad minus iste voluptate pariatur ab consectetur non atque repudiandae molestias. Eligendi in doloribus tempora! Laboriosam, tenetur?
                    Ipsam veniam natus, eaque voluptatibus at fuga quaerat nostrum eveniet libero iusto maiores earum cum aperiam culpa ducimus ad nisi impedit quas dolorum? Aliquid cupiditate animi praesentium deserunt iste facilis.
                    Saepe fuga accusantium earum quod in dolorum voluptate veniam, dolores rem sed recusandae, quasi ea enim quis non, id ut sint. Repellat ipsum natus ipsam laboriosam beatae eligendi at rem?</Typography>
            </>
        );
    }

    const handleOpenModal = () => {
        showModal(<ModalContent />);
    }

    const handleShowNotification = () => {
        showNotification('fas fa-bell', 'neutral', 'Notificacion', 'Esta es una notificacion de ejemplo');
    }



    return (
        <Container>
            <Box className="flex flex-col md:flex-row items-center justify-start gap-4 mb-4">
                <Card title="Card Title" subtitle="Card Subtitle" actions={abA}>
                    <Typography variant="h1">Typography</Typography>
                    <Typography variant="h2">Typography</Typography>
                    <Typography variant="subtitle">Typography</Typography>
                    <Typography variant="body">Typography</Typography>
                    <Typography variant="caption">Typography</Typography>
                    <Box className="flex flex-row w-fit gap-4">
                        <Button type="primary" text="Open modal" onClick={handleOpenModal} />
                        <Button type="accent" text="Show notification" onClick={handleShowNotification} />
                    </Box>
                </Card>

                <Card title="Card Title" subtitle="Card Subtitle" actions={abB}>
                    <Typography variant="h1">Typography</Typography>
                    <Typography variant="h2">Typography</Typography>
                    <Typography variant="subtitle">Typography</Typography>
                    <Typography variant="body">Typography</Typography>
                    <Typography variant="caption">Typography</Typography>
                    <Box className="flex flex-row w-fit gap-4">
                        <Button type="primary" text="Open modal" onClick={handleOpenModal} />
                        <Button type="accent" text="Show notification" onClick={handleShowNotification} />
                    </Box>
                </Card>
            </Box>
            <Card title="Card Title" subtitle="Card Subtitle" actions={abC}>
                <Typography variant="h1">Typography</Typography>
                <Typography variant="h2">Typography</Typography>
                <Typography variant="subtitle">Typography</Typography>
                <Typography variant="body">Typography</Typography>
                <Typography variant="caption">Typography</Typography>
                <Box className="flex flex-row w-fit gap-4">
                    <Button type="primary" text="Open modal" onClick={handleOpenModal} />
                    <Button type="accent" text="Show notification" onClick={handleShowNotification} />
                </Box>
            </Card>

            <Box className="my-4 flex flex-row gap-2">
                <Chip text="Ejemplo" color="neutral" />
                <Chip text="Ejemplo" color="info" />
                <Chip text="Ejemplo" color="success" />
                <Chip text="Ejemplo" color="warning" />
                <Chip text="Ejemplo" color="danger" />
                <Chip text="Ejemplo" color="accent" />

                <Chip color="success" />
                <Chip color="warning" />
                <Chip color="danger" />
            </Box>

            <Box className="">
                <Banner icon="fas fa-info" title="Ejemplo Informacion" description="Banner de ejemplo para alguna informacion" color="info" />
                <Banner icon="fas fa-warning" title="Ejemplo Advertencia" description="Banner de ejemplo para alguna advertencia" color="warning" />
                <Banner icon="fas fa-check" title="Ejemplo Exito" description="Banner de ejemplo para alguna advertencia" color="success" />
                <Banner icon="fas fa-times" title="Ejemplo Error" description="Banner de ejemplo para alguna advertencia" color="danger" />
            </Box>

            <ClientForm dropdownOptions={options} />

            <Link icon="fas fa-chain" text="En la misma ventana" newWindow={false} url="www.google.com" />
            <Link icon="fas fa-chain" text="En otra ventana" url="www.google.com" />

            <Tooltip content="Este es un tooltip de ejemplo" placement="right" className="self-center">
                <Box className="flex justify-center items-center w-fit h-16 p-10 bg-purple-600 border-2 border-dashed">
                    <Typography variant="body">Este box tiene un tooltip</Typography>
                </Box>
            </Tooltip>

        </Container >
    );
}
